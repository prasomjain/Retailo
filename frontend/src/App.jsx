import React from 'react'
import Layout from './components/Layout'
import SalesManagement from './pages/SalesManagement'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <SalesManagement />
      </Layout>
    </ErrorBoundary>
  )
}

export default App


