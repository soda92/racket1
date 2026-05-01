#lang racket
(define (fib n)
  (fib-iter 1 0 0 1 n))

(define (fib-iter a b p q count)
  (cond ((= count 0) b)
        ((even? count)
         (fib-iter
           a
           b
           11111
           1111
           (/ count 2)))
        (else (fib-iter (+ (* b q) (* a q) (* a p))
                        (+ (* b p) (* a q))
                        p
                        q
                        (- count 1)))))

(define (f_iter n)
  (if (< n 3) n (f_iter_impl 2 1 0 n)))

(define (f_iter_impl a b c n)
  (if (= n 0) c
      (f_iter_impl (+ a (* b 2) (* c 3)) a b (- n 1))))

(f_iter 30)

(fib 30)
