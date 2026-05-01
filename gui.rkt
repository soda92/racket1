#lang racket/gui

;; Improved Guessing Game UI

(define range 20)
(define secret (random range))
(define attempts 0)
(define all-buttons '())

(define frame (new frame% 
                   [label "Guessing Game"]
                   [width 300]
                   [height 400]
                   [alignment '(center center)]))

(define (update-status txt)
  (send status set-label txt))

(define msg (new message% 
                 [parent frame]
                 [label (format "I'm thinking of a number between 0 and ~a" (sub1 range))]
                 [font (make-object font% 11 'default)]))

(define status (new message%
                    [parent frame]
                    [label "Good luck!"]
                    [auto-resize #t]
                    [font (make-object font% 12 'default 'normal 'bold)]))

(define grid-panel (new vertical-panel% 
                        [parent frame]
                        [alignment '(center center)]
                        [spacing 5]
                        [border 10]))

(define (check-guess i btn)
  (set! attempts (add1 attempts))
  (cond
    [(= i secret)
     (update-status (format "Correct! It was ~a." i))
     (send btn set-label "★")
     (message-box "Winner!" (format "You found it in ~a attempts!" attempts))
     (reset-ui)]
    [(> i secret)
     (update-status (format "~a is too High" i))
     (send btn enable #f)]
    [else
     (update-status (format "~a is too Low" i))
     (send btn enable #f)]))

(define (reset-ui [b #f] [e #f])
  (set! secret (random range))
  (set! attempts 0)
  (update-status "Game reset! Pick a number.")
  (for ([btn (reverse all-buttons)]
        [i (in-range range)])
    (send btn set-label (~a i))
    (send btn enable #t)))

;; Create buttons in a 4x5 grid
(for ([row (in-range 4)])
  (define h-panel (new horizontal-panel% 
                       [parent grid-panel]
                       [alignment '(center center)]))
  (for ([col (in-range 5)])
    (define i (+ (* row 5) col))
    (define btn (new button%
                     [label (~a i)]
                     [parent h-panel]
                     [min-width 45]
                     [min-height 45]
                     [callback (lambda (btn evt) (check-guess i btn))]))
    (set! all-buttons (cons btn all-buttons))))

(new button% 
     [parent frame]
     [label "Restart"]
     [callback reset-ui])

(send frame show #t)
