# Questrade Portfolio Viewer

This project is an account portfolio viewer for Questrade clients. This project allows users to understand the contents of their portfolios, use interactive graphs, get real-time stock + options pricing data, and manage account orders easily.

If you are a Questrade Client and want to give the project a try visit the link here: [Questrade Portfolio Viewer](https://questrade-portfolio-view.herokuapp.com/)

If you tried out the project and liked it or have some feedback feel free shoot me an email here: [Email Rohan Ravindran](mailto:r8ravind@uwaterloo.ca?subject=Questrade%20Portfolio%20Viewer)

## How it was built

This project was built using React + Redux on the frontend and Node + MongoDB + Express on the backend.

- Used the OAuth2 Standard for user authentication. Implemented custom Express middleware to preemptively fetch new access tokens upon expiry
- For security purposes AES Encryption, Passport.js, and Cookie-Session were used to maintain a user's session securely
- Used MongoDB along with Mongoose to store user data
- Utilized a client side proxy along with Axios to forward appropriate requests between the frontend and backend
- Redux + Redux Thunk were used when writing action creators and reducers to fetch data from the backend and update the client side Redux Store
- Utilized the Nivo Rocks graphing library to create interactive graphs
- Utilized a mix of both functional and class based components along with component hooks and lifecycle methods
- Utilized Web Sockets on the client side to fetch real-time pricing and orders data
- Used Semantic-UI along with custom CSS and CSS Media Queries to style the site and create responsive behaviour

## Screenshots

#### Accounts Page

![](https://github.com/rohanrav/questrade_portfolio_view/blob/main/screenshots/AccountsPage.png)

#### Account Details Page

![](https://github.com/rohanrav/questrade_portfolio_view/blob/main/screenshots/AccountDetail.png)

#### Stock Detail Page

![](https://github.com/rohanrav/questrade_portfolio_view/blob/main/screenshots/StockDetailPage.png)

#### Orders Page

![](https://github.com/rohanrav/questrade_portfolio_view/blob/main/screenshots/OrdersPage.png)
