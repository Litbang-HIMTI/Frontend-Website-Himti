# Table of Contents

- [Table of Contents](#table-of-contents)
- [Recommended Tools & Extensions](#recommended-tools--extensions)
- [Learning Resource](#learning-resource)
  - [Documentation](#documentation)
  - [Videos](#videos)
- [Note](#note)
  - [Next.js](#nextjs)
  - [Error Handling](#error-handling)
  - [Authentication](#authentication)

# Recommended Tools & Extensions

- [VSCode](https://code.visualstudio.com/)
- [GitHub Desktop](https://desktop.github.com/)
- [Github Copilot](https://github.com/features/copilot)
- [Better Comments (VsCode Extension)](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)

# Learning Resource

## Documentation

- [Next.js](https://nextjs.org/docs)
- [Typescript](https://www.typescriptlang.org/docs/)

## Videos

- [Learn TypeScript - Full Course for Beginners by FreeCodeCamp (1h 34m)](https://youtu.be/gp5H0Vw39yw)
- [Next.js in 100 Seconds // Plus Full Beginner's Tutorial (11m 52s)](https://www.youtube.com/watch?v=Sklc_fQBmcs&t=4s)
- [Next.js crash course (1h 9m)](https://youtu.be/mTz0GXj8NN0)

# Note

## Next.js

- [link](https://nextjs.org/learn/basics/navigate-between-pages/link-component)
- [no img element](https://nextjs.org/docs/messages/no-img-element)
- [get initial props](https://nextjs.org/docs/api-reference/data-fetching/get-initial-props)

## Error Handling

Next.js handles errors by rendering a custom error page. The error page is rendered in the browser, and the error is logged to the console. We have created custom error page for `404` and other error. 404 is handled in [`pages/404.ts`](../pages/404.tsx). Other errors are handled in [`pages/_error.ts`](../pages/_error.tsx). This component is only used in production. When in development, Next.js will show the error stack.

[[Read more about handling error]](https://stackoverflow.com/questions/71119300/how-to-throw-a-500-error-from-getstaticprops) - [[Custom error page]](https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing)

## Authentication

Because of CORS, we will need to set up a local API to fetch data from the backend server. Example located in the [`login page`](../pages/auth/login.tsx). It fetch the data not directly to the backend but through local [Next.js API](../pages/api/v1/auth/login.ts).
