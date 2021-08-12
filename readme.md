# Questrade Portfolio Viewer

This project is an investing account portfolio viewer for Questrade clients. This project allows users to understand the contents of their portfolios, use interactive graphs, get options pricing data, and manage accounts orders easily.

If you are a Questrade Client and want to give the project a try visit the link here: [Questrade Portfolio Viewer](https://questrade-portfolio-view.herokuapp.com/)

If you tried out the project and liked it or have some feedback for me feel free shoot me an email here: [Email Rohan Ravindran](mailto:r8ravind@uwaterloo.ca?subject=Questrade%20Portfolio%20Viewer)

## Screenshots

#### Accounts Page

!()[]

#### Account Details Page

!()[]

#### Stock Detail Page

!()[]

#### Orders Page

!()[]

## How it was built

This project was built using the MERN stack.

- React + Redux, MongoDB (Mongoose) + Node + Express
- AES Encryption + Passport.js & cookie session
- Axios for external requests
- Used OAuth 2 Standard for Authentication, maintain refresh token + access token, preemptively fetch access token from refresh token
- Used Semantic UI
- Setup Proxy between node server and react server
- Used Redux + Redux Thunk to fetch data from backend and store in global state (wrote action creators + reducers)
- Utilized Nivo Rocks to create interactive graphs
- Utilized functional and class based components with component lifecycle methods and hooks (refs, etc.)
- Utilized web sockets to fetch real time stock and orders data
- Used Semantic UI along with custom CSS, and media queries to style the site and create responsive behaviour
