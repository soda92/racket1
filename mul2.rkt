#lang racket
(define (double x) (+ x x))
(define (halve x) (/ x 2))
(define (mul a b)
  (if (= b 0) 0
      (if (= b 1) a
          (cond ((even? b) (mul (double a) (halve b)))
                (else (+ a (mul a (- b 1))))
                )))
  )

(mul 3 4)
