import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { RoadmapsPage } from './pages/RoadmapsPage';
import { CreateRoadmapPage } from './pages/CreateRoadmapPage';
import { RoadmapDetailPage } from './pages/RoadmapDetailPage';
import { VerificationDetailPage } from './pages/VerificationDetailPage';
import { GrantsPage } from './pages/GrantsPage';
import { CreateGrantPage } from './pages/CreateGrantPage';
import { GrantDetailPage } from './pages/GrantDetailPage';
import { CreditsPage } from './pages/CreditsPage';
import { EvidencePage } from './pages/EvidencePage';
import { LimitsPage } from './pages/LimitsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <WalletProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col bg-[#F7F4EC] text-[#22231F] dark:bg-[#181916] dark:text-[#EDECE6] font-sans antialiased transition-colors">
            <Header />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/roadmaps" element={<RoadmapsPage />} />
                <Route path="/roadmaps/new" element={<CreateRoadmapPage />} />
                <Route path="/roadmaps/:id" element={<RoadmapDetailPage />} />
                <Route path="/verifications/:id" element={<VerificationDetailPage />} />
                <Route path="/grants" element={<GrantsPage />} />
                <Route path="/grants/new" element={<CreateGrantPage />} />
                <Route path="/grants/:id" element={<GrantDetailPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                <Route path="/evidence" element={<EvidencePage />} />
                <Route path="/limits" element={<LimitsPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </HashRouter>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;
