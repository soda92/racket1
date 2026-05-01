#lang racket/gui

;; let's play a guessing game

(define frame (new frame% [label "Guess"]))
(define range 20)
(define secret (random range))
(define ((check i) _btn _evt)
  (define found?
    (cond ((= i secret) "Found")
          ((> i secret) "Greater")
          (else "Less"))
    )
  (message-box "?" found?)
  (when (= i secret)
    (send frame show #false)))

(for ([i (in-range range)])
  (new button%
    [label (~a i)]
    [parent frame]
    [callback (check i)]))

(send frame show #t)