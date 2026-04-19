#lang racket
(define (f_rec n)
  (cond
    ((< n 3) n)
    (else (+
            (f_rec (- n 1))
            (* 2 (f_rec (- n 2)))
            (* 3 (f_rec (- n 3)))))))

(f_rec 30)

(define (f_iter n)
  (if (< n 3) n (f_iter_impl 2 1 0 n)))

(define (f_iter_impl a b c n)
  (if (= n 0) c
      (f_iter_impl (+ a (* b 2) (* c 3)) a b (- n 1))))

(f_iter 30)


(require rackunit)
(module+ test
  (check-equal? (f_rec 3) 4 "Basic addition check")
  (check-equal? (f_iter 3) 4)
  (check-equal? (f_rec 4) 11 "Basic addition check")
  (check-equal? (f_iter 4) 11)
  0)