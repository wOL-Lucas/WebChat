import './App.css';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './components/sidebar/sidebar';
import { RequireAuth } from 'react-auth-kit';

const Display = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 20px;
`

const Container = styled.div`
  display: flex;
`

function App() {
  return (
    <RequireAuth loginPath="/login">
      <Container>
        <Sidebar />
        <Display>
          <Outlet />
        </Display>
      </Container>
    </RequireAuth>
  );
}

export default App;
