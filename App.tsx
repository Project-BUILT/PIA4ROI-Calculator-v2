import React, { PropsWithChildren } from 'react';
import {
  HashRouter,
  MemoryRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { QuickCalc } from './pages/QuickCalc';
import { Results } from './pages/Results';
import { DeepDive } from './pages/DeepDive';
import { CouncilReport } from './pages/CouncilReport';
import { Assumptions } from './pages/Assumptions';

// AI Studio runs the app in a sandboxed blob: URL (often on *.usercontent.goog).
// In that environment, HashRouter navigation can trigger Location.assign,
// which gets blocked. MemoryRouter avoids touching window.location.
const isAiStudioSandbox =
  window.location.protocol === 'blob:' ||
  window.location.hostname.endsWith('.usercontent.goog');

function AppRouter({ children }: PropsWithChildren) {
  return isAiStudioSandbox ? (
    <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
  ) : (
    <HashRouter>{children}</HashRouter>
  );
}

function App() {
  return (
    <AppRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quick" element={<QuickCalc />} />
          <Route path="/results" element={<Results />} />
          <Route path="/deep-dive" element={<DeepDive />} />
          <Route path="/council-report" element={<CouncilReport />} />
          <Route path="/assumptions" element={<Assumptions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AppRouter>
  );
}

export default App;