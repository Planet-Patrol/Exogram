import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/Header';
import DictionaryPage from './routes/DictionaryPage';
import Home from './routes/Home';
import PageNotFound from './routes/PageNotFound';
import SignInPage from './routes/SignInPage';
import TicChartsPage from './routes/TicChartsPage';
import { TicPage } from './routes/TicPage';
import TicTablePage from './routes/TicTablePage';
import './styles/style.scss';

function App() {
  return (
    <Router>
      <Header />
      <div className="content-wrapper">
        <div>
          <Routes>
            <Route index element={<Home />} />
            <Route path="table" element={<TicTablePage />} />
            <Route path="charts" element={<TicChartsPage />}>
              <Route path=":ticIds" element={<TicChartsPage />} />
            </Route>
            <Route path="dictionary" element={<DictionaryPage />} />
            <Route path="tic/:ticId" element={<TicPage />} />
            <Route path="signin" element={<SignInPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
