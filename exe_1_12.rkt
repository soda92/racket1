#lang racket

(define (pascal_triangle row col)
  (cond [(> col row) 1]
        [(= row col) 1]
        [else
         (if (= col 1) 1 (+
                           (pascal_triangle (- row 1) (- col 1))
                           (pascal_triangle (- row 1) col)
                           )
             )
         ]
        )
  )

(pascal_triangle 7 4)