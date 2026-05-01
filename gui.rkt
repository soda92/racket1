#lang racket/gui

;; let's play a guessing game

(define frame (new frame% [label "Guess"]))

(define secret (random 5))
(define ((check i) btn evt)
  (define found? (if (= i secret) "Yes" "No"))
  (message-box "?" found?)
  (when (= i secret)
    (send frame show #false)))

(for ([i (in-range 5)])
   (new button%
        [label (~a i)]
        [parent frame]
        [callback (check i)]))

(send frame show #t)