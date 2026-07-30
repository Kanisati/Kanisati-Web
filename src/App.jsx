import './App.scss'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { PublicLayout } from './layouts/PublicLayout';
import Home from './pages/Home';

function App() {
  return (
    <MantineProvider theme={theme}>
      <PublicLayout>
        <Home />
      </PublicLayout>
    </MantineProvider>
  )
}

export default App
