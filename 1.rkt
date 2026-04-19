#lang racket
(require rackunit)

(define (add-one x) (+ x 1))
(add-one 11)

;; This code only runs when you execute 'raco test' or run the file
(module+ test
  (check-equal? (add-one 2) 3 "Basic addition check")
  (check-equal? (add-one -1) 0))