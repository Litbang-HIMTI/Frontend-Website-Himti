# Table of Contents

- [Table of Contents](#table-of-contents)
- [Recommended Tools & Extensions](#recommended-tools--extensions)
- [Learning Resource](#learning-resource)
  - [Documentation](#documentation)
  - [Videos](#videos)
- [Note](#note)
  - [Next.js](#nextjs)
  - [CORS](#cors)
  - [React Beautiful dnd](#react-beautiful-dnd)
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
- [Mantine UI](https://mantine.dev/)
- [Tabler Icons](https://tablericons.com/)

## Videos

- [Learn TypeScript - Full Course for Beginners by FreeCodeCamp (1h 34m)](https://youtu.be/gp5H0Vw39yw)
- [Next.js in 100 Seconds // Plus Full Beginner's Tutorial (11m 52s)](https://www.youtube.com/watch?v=Sklc_fQBmcs&t=4s)
- [Next.js crash course (1h 9m)](https://youtu.be/mTz0GXj8NN0)

# Note

## Next.js

- [link](https://nextjs.org/learn/basics/navigate-between-pages/link-component)
- [no img element](https://nextjs.org/docs/messages/no-img-element)
- [get initial props](https://nextjs.org/docs/api-reference/data-fetching/get-initial-props)

## URL

- [change url without refresh](https://stackoverflow.com/questions/62845014/change-url-without-page-refresh-next-js)
- [remove query params](https://stackoverflow.com/questions/65606974/next-js-how-to-remove-query-params)

## CORS

- [CORS with Postman](https://stackoverflow.com/questions/36250615/cors-with-postman)
- [Express Session Cookie Not Being Set when using React Axios POST Request](https://stackoverflow.com/questions/63251837/express-session-cookie-not-being-set-when-using-react-axios-post-request)
- [Using CORS in Express](https://medium.com/zero-equals-false/using-cors-in-express-cac7e29b005b)
- [Why doesn't adding CORS headers to an OPTIONS route allow browsers to access my API?](https://stackoverflow.com/questions/7067966/why-doesnt-adding-cors-headers-to-an-options-route-allow-browsers-to-access-my)

## React Beautiful dnd

- https://stackoverflow.com/questions/64242578/how-to-fix-data-rbd-draggable-context-id-did-not-match-server-1-client-0
- https://github.com/atlassian/react-beautiful-dnd/issues/1756
- https://stackoverflow.com/questions/71080180/invariant-failed-draggableid-13-unable-to-find-drag-handle
- https://github.com/atlassian/react-beautiful-dnd/issues/1756
- https://github.com/atlassian/react-beautiful-dnd/issues/1673#issuecomment-571293508

## Error Handling

Next.js handles errors by rendering a custom error page. The error page is rendered in the browser, and the error is logged to the console. We have created custom error page for `404` and other error. 404 is handled in [`pages/404.ts`](../pages/404.tsx). Other errors are handled in [`pages/_error.ts`](../pages/_error.tsx). This component is only used in production. When in development, Next.js will show the error stack.

[[Read more about handling error]](https://stackoverflow.com/questions/71119300/how-to-throw-a-500-error-from-getstaticprops) - [[Custom error page]](https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing)

## Authentication

Because of CORS, we will need to set up a local API to fetch data from the backend server. Example located in the [`login page`](../pages/auth/login.tsx). It fetch the data not directly to the backend but through local [Next.js API](../pages/api/v1/auth/login.ts).
