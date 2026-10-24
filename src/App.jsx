import './App.scss'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { PublicLayout } from './layouts/PublicLayout';
import Home from './pages/Home';
import AuthProvider from './contexts/AuthProvider';

function App() {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <PublicLayout>
          <Home />
        </PublicLayout>
      </AuthProvider>
    </MantineProvider>
  )
}

export default App
