# Project Structure

This is a non-exhaustive list, but these are the files you should be familiar with when working with the Crosswords repo.

- **`src/`**: This is the main source folder where all the React components, styles, and application logic reside. Key files include:
  - **`App.js`**: The root component of the application.
  - **`index.js`**: The entry point of the application, responsible for rendering the React app into the DOM.
  - **`App.css`**: Contains styles specific to the `App` component.
  - **`index.css`**: Global styles for the application.
  - **`PuzzleList.js`**: renders a list of crossword puzzles with links to navigate to individual puzzle pages using React Router.
  - **`PuzzleFull.js`**: 
  This component renders a full-screen iframe that embeds a crossword puzzle based on the `puzzleId` retrieved from the URL parameters using `react-router-dom`.
- **`PuzzleIndex.js`**: 
  This component displays a list of crossword puzzles with their titles and publication times. Each puzzle is a clickable link that navigates to its full-screen view.
- **`XML.jsx`**: 
  This component fetches and displays a paginated list of crossword puzzles. It includes a spotlight feature for highlighting specific puzzles, a grid layout for displaying puzzles, and navigation buttons for pagination. It uses styled-components for styling and fetches data from an external API through a CORS proxy.

- **`public/`**: This folder contains static assets that are served directly without processing. Key files include:
  - **`index.html`**: The main HTML file that serves as the template for the React app.
  - **`favicon.ico`**: The favicon for the application. (the little icon that you see on the tab of a website)

- **`node_modules/`**: Contains all the dependencies and packages installed via npm.

- **`package.json`**: Lists the project dependencies, scripts, and metadata.

- **`package-lock.json`**: Automatically generated file that locks the versions of dependencies.

- **`README.md`**: This file, which provides an overview of the project and instructions for usage.

- **`.gitignore`**: Specifies files and directories to be ignored by Git.

- **`build/`**: This folder is generated after running `npm run build` and contains the optimized production-ready code.

- **`.env`**: (Optional) Used to define environment-specific variables.

This structure is typical for projects bootstrapped with Create React App.

# The First Time You Run It

## `npm install`

Installs the dependencies for this project. Boom! All set up.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
