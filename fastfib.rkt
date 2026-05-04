#lang racket
(define (fib n)
  (fib-iter 1 0 0 1 n))

(define (fib-iter a b p q count)
  (cond ((= count 0) b)
        ((even? count)
         (fib-iter
           a
           b
           (+ (* p p) (* q q))
           (+ (* 2 p q) (* q q))
           (/ count 2)))
        (else (fib-iter (+ (* b q) (* a q) (* a p))
                        (+ (* b p) (* a q))
                        p
                        q
                        (- count 1)))))

(define (f_iter n)
  (if (< n 2) n (f_iter_impl 1 0 n)))

(define (f_iter_impl a b n)
  (if (= n 0) b
      (f_iter_impl (+ a b) a (- n 1))))

(f_iter 30)

(fib 30)
