import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Error from './views/error/error.js'
import Login from './views/login/login.js'
import Home from './views/home/home.js'
import Chat from './views/chat/chat.js'
import Load from './views/chat/load.js'
import Create from './views/chat/create.js'
import App from './App';
import { AuthProvider } from "react-auth-kit";
import {RouterProvider, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter(
  [

    {
      path: '/',
      element: <App />,
      errorElement: <Error />,
      children: [
        {
          path: '/home',
          element: <Home />,
          errorElement: <Error />,
        },
        {
          path: '/chat',
          element: <Chat />,
        },
        {
          path: '/load',
          element: <Load />,
        },
        {
          path: '/create',
          element: <Create />,
        }
      ]
    },
    {
      path: '/login',
      element: <Login />,
    }
  ]
);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider authStorageType="cookie">
      <RouterProvider router={router}/>
    </AuthProvider>
  </React.StrictMode> 
);
