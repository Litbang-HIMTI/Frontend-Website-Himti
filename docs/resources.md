# Table of Contents

- [Table of Contents](#table-of-contents)
- [Note](#note)
  - [Next](#next)
  - [Error Handling](#error-handling)

# Note

## Next

- [link](https://nextjs.org/learn/basics/navigate-between-pages/link-component)
- [no img element](https://nextjs.org/docs/messages/no-img-element)
- [get initial props](https://nextjs.org/docs/api-reference/data-fetching/get-initial-props)

## Error Handling

Next.js handles errors by rendering a custom error page. The error page is rendered in the browser, and the error is logged to the console. We have created custom error page for `404` and other error. 404 is handled in [`pages/404.ts`](../pages/404.tsx). Other errors are handled in [`pages/_error.ts`](../pages/_error.tsx). [read about throwing error](https://stackoverflow.com/questions/71119300/how-to-throw-a-500-error-from-getstaticprops), [custom error page](https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing).
