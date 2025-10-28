import Layout from "./Layout.jsx";

import Tombs from "./Tombs";

import Artifacts from "./Artifacts";

import AddTomb from "./AddTomb";

import AddArtifact from "./AddArtifact";

import TombDetail from "./TombDetail";

import ArtifactDetail from "./ArtifactDetail";

import Documentation from "./Documentation";

import AddDocumentation from "./AddDocumentation";

import DocumentationDetail from "./DocumentationDetail";

import Dashboard from "./Dashboard";

import Home from "./Home";

import EditTomb from "./EditTomb";

import EditArtifact from "./EditArtifact";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Tombs: Tombs,
    
    Artifacts: Artifacts,
    
    AddTomb: AddTomb,
    
    AddArtifact: AddArtifact,
    
    TombDetail: TombDetail,
    
    ArtifactDetail: ArtifactDetail,
    
    Documentation: Documentation,
    
    AddDocumentation: AddDocumentation,
    
    DocumentationDetail: DocumentationDetail,
    
    Dashboard: Dashboard,
    
    Home: Home,
    
    EditTomb: EditTomb,
    
    EditArtifact: EditArtifact,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Tombs />} />
                
                
                <Route path="/Tombs" element={<Tombs />} />
                
                <Route path="/Artifacts" element={<Artifacts />} />
                
                <Route path="/AddTomb" element={<AddTomb />} />
                
                <Route path="/AddArtifact" element={<AddArtifact />} />
                
                <Route path="/TombDetail" element={<TombDetail />} />
                
                <Route path="/ArtifactDetail" element={<ArtifactDetail />} />
                
                <Route path="/Documentation" element={<Documentation />} />
                
                <Route path="/AddDocumentation" element={<AddDocumentation />} />
                
                <Route path="/DocumentationDetail" element={<DocumentationDetail />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/EditTomb" element={<EditTomb />} />
                
                <Route path="/EditArtifact" element={<EditArtifact />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}