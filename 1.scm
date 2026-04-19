#lang sicp

(define (add-one x) (+ x 1))
(add-one 11)

(define (factorial n)
  (if (= n 1)
      1
      (* n (factorial (- n 1)))))

(factorial 5)