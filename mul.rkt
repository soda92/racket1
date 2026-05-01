#lang sicp
(define (double x) (* x 2))
(define (halve x) (/ x 2))
(define (mul a b)
  (define (mul-iter res a b)
    (if (= b 0) res
            (cond ((even? b) (mul-iter res (double a) (halve b)))
                  (else (mul-iter (+ res a) a (- b 1))))
            ))
  (mul-iter 0 a b)
)

(mul 3 4)
