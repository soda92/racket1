# Project Standards

## React / JSX
- **Buttons:** Always specify a `type` attribute for `<button>` elements (e.g., `type="button"`, `type="submit"`). Deno lint rule: `jsx-button-has-type`.
- **Async Functions:** Do not use the `async` keyword if the function body does not use `await`. Deno lint rule: `require-await`.
- **Touch Support:** Interactive elements that support dragging or custom interactions should implement both mouse and touch events to ensure mobile usability.

## Linting
- The project uses `deno lint`. Ensure all changes pass linting before committing.
- Run `deno lint` to check for issues.
