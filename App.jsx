import React, { useState, useEffect, useRef } from 'react';
import { generateText } from './services/genApi';
import { Upload, Search, Star, Download, BookOpen, Users, TrendingUp, Settings, Trash2, UserPlus, LogIn, Shield, Eye, Folder, FileText, Bot, User, FileQuestion, Zap, Send, Home, ChevronRight } from 'lucide-react';

const organizeFilesBySubjectAndUnit = (files) => {
  const folders = {};
  files.forEach(file => {
    if (!folders[file.subject]) {
      folders[file.subject] = {
        name: file.subject,
        units: {}
      };
    }
    
    const unitKey = `Unit ${file.unit}`;
    if (!folders[file.subject].units[unitKey]) {
      folders[file.subject].units[unitKey] = [];
    }
    
    folders[file.subject].units[unitKey].push(file);
  });
  return folders;
};


const createFolderStructure = (folders) => {
  return {
    id: 'root',
    name: 'All Files',
    type: 'folder',
    children: Object.entries(folders).map(([subject, subjectData]) => ({
      id: `subject-${subject.toLowerCase().replace(/\s+/g, '-')}`,
      name: subject,
      type: 'folder',
      children: Object.entries(subjectData.units).map(([unitName, unitFiles]) => ({
        id: `unit-${subject.toLowerCase().replace(/\s+/g, '-')}-${unitName.toLowerCase().replace(/\s+/g, '-')}`,
        name: unitName,
        type: 'folder',
        files: unitFiles
      }))
    }))
  };
};

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [activeTab, setActiveTab] = useState('browse');
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const savedFiles = localStorage.getItem('campusFiles');
    const savedUsers = localStorage.getItem('campusUsers');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('main');
    }

    // Initialize folder structure
    if (savedFiles) {
      const folders = organizeFilesBySubjectAndUnit(JSON.parse(savedFiles));
      const rootFolder = createFolderStructure(folders);
      setCurrentFolder(rootFolder);
      setBreadcrumbs([rootFolder]);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('campusFiles', JSON.stringify(files));
    localStorage.setItem('campusUsers', JSON.stringify(users));
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, [files, users, user]);

  // Update folder structure when files change
  useEffect(() => {
    const folders = organizeFilesBySubjectAndUnit(files);
    const rootFolder = createFolderStructure(folders);
    if (!currentFolder || currentFolder.id === 'root') {
      setCurrentFolder(rootFolder);
      setBreadcrumbs([rootFolder]);
    }
  }, [files]);

  // Test AI generation on load (development only)
  useEffect(() => {
    const testAI = async () => {
      try {
        console.log('Testing AI response...');
        const response = await generateText('Give a short friendly greeting');
        console.log('AI Test Response:', response);
        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log('Extracted text:', response.candidates[0].content.parts[0].text);
        }
      } catch (error) {
        console.error('AI test failed:', error);
      }
    };
    // Uncomment to test:
    // testAI();
  }, []);

  const handleLogin = (email, password) => {
    // Hardcoded admin account (hidden from UI but functional)
    if (email === "admin@campus.com" && password === "admin123") {
      const adminUser = {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@campus.com',
        role: 'admin',
        reputation: 1000,
        department: 'Administration',
        semester: 'N/A',
        joinedDate: new Date().toISOString(),
        uploads: 0,
        downloads: 0
      };
      setUser(adminUser);
      setIsGuest(false);
      setCurrentView('main');
      return;
    }

    // Regular user login
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      setIsGuest(false);
      setCurrentView('main');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleSignup = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      reputation: 100,
      uploads: 0,
      downloads: 0,
      joinedDate: new Date().toISOString(),
      role: 'student' // All new signups are students
    };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setIsGuest(false);
    setCurrentView('main');
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'guest',
      reputation: 0,
      department: 'N/A',
      semester: 'N/A',
      joinedDate: new Date().toISOString(),
      uploads: 0,
      downloads: 0
    };
    setUser(guestUser);
    setIsGuest(true);
    setCurrentView('main');
  };

  const handleLogout = () => {
    setUser(null);
    setIsGuest(false);
    setCurrentView('login');
    localStorage.removeItem('currentUser');
  };

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder);
    // Update breadcrumbs
    const folderIndex = breadcrumbs.findIndex(f => f.id === folder.id);
    if (folderIndex !== -1) {
      setBreadcrumbs(breadcrumbs.slice(0, folderIndex + 1));
    } else {
      setBreadcrumbs([...breadcrumbs, folder]);
    }
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900 to-dark-800 text-white">
      {/* Header */}
      {currentView === 'main' && (
        <header className="border-b border-purple-500/20 bg-dark-800/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
                    Campus Materials Exchange
                  </h1>
                  <p className="text-sm text-gray-400">
                    Welcome, {user?.name} 
                    {isGuest && <span className="text-yellow-400 ml-2">(Guest Mode)</span>}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-1 bg-dark-700 rounded-2xl p-1">
                  {['browse', 'upload', 'profile', 'settings', ...(user?.role === 'admin' ? ['admin'] : [])].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-xl font-medium capitalize transition-all ${
                        activeTab === tab 
                          ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                >
                  {isGuest ? 'Exit Guest Mode' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'login' && (
          <LoginView 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setCurrentView('signup')}
            onGuestLogin={handleGuestLogin}
          />
        )}
        {currentView === 'signup' && (
          <SignupView 
            onSignup={handleSignup} 
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}
        {currentView === 'main' && (
          <>
            {activeTab === 'browse' && (
              <BrowseSection 
                files={files} 
                user={user} 
                isGuest={isGuest}
                onFileUpdate={setFiles}
                onPreviewFile={setSelectedFileForPreview}
                folders={organizeFilesBySubjectAndUnit(files)}
                currentFolder={currentFolder}
                breadcrumbs={breadcrumbs}
                onNavigateToFolder={navigateToFolder}
                onNavigateToBreadcrumb={navigateToBreadcrumb}
              />
            )}
            {activeTab === 'upload' && <UploadSection onUpload={() => setShowUploadForm(true)} isGuest={isGuest} />}
            {activeTab === 'profile' && <ProfileSection user={user} files={files} isGuest={isGuest} />}
            {activeTab === 'settings' && <SettingsSection user={user} onUserUpdate={setUser} isGuest={isGuest} />}
            {activeTab === 'admin' && user?.role === 'admin' && (
              <AdminSection users={users} files={files} onUsersUpdate={setUsers} onFilesUpdate={setFiles} />
            )}
          </>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadForm && (
        <UploadForm 
          onClose={() => setShowUploadForm(false)}
          onUpload={(newFile) => {
            setFiles(prev => [...prev, newFile]);
            setShowUploadForm(false);
          }}
          user={user}
        />
      )}

      {/* PDF Preview Modal */}
      {selectedFileForPreview && (
        <PDFPreviewModal 
          file={selectedFileForPreview}
          onClose={() => setSelectedFileForPreview(null)}
          isGuest={isGuest}
        />
      )}
    </div>
  );
}

// Enhanced Login Component with Guest Option
function LoginView({ onLogin, onSwitchToSignup, onGuestLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900 to-dark-800 flex items-center justify-center p-4">
      <div className="bg-dark-800/80 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-purple-500/20">
        <div className="text-center mb-8">
          <div className="p-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl inline-block mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
            Welcome to Campus Materials Exchange MVSR
          </h2>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
          >
            Sign In
          </button>
        </form>

        {/* Guest Login Option */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-400 text-center mb-3">
          </p>
          <button
            onClick={onGuestLogin}
            className="w-full py-2 bg-gray-600/20 text-gray-300 rounded-lg font-medium hover:bg-gray-600/30 transition-colors border border-gray-500/20"
          >
            Continue as Guest
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Guest users can browse but cannot upload or download
          </p>
        </div>

        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-primary-400 hover:text-primary-300 font-medium">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

// Signup Component - ORIGINAL
function SignupView({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    semester: '',
    skills: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignup(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900 to-dark-800 flex items-center justify-center p-4">
      <div className="bg-dark-800/80 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-purple-500/20">
        <div className="text-center mb-8">
          <div className="p-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl inline-block mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-400 mt-2">Join our learning community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-primary-400"
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Semester *</label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData(prev => ({...prev, semester: e.target.value}))}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-primary-400"
              required
            >
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl font-bold text-white hover:scale-105 transition-transform mt-6"
          >
            Create Student Account
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

// Upload Form Component - ORIGINAL with Unit selection
function UploadForm({ onClose, onUpload, user }) {
  const [uploadData, setUploadData] = useState({
    subject: '',
    courseCode: '',
    unit: '',
    description: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.subject || !uploadData.unit) {
      alert('Please fill all required fields and select a file');
      return;
    }

    setIsUploading(true);

    try {
      // Generate AI tags
      let aiTags = [];
      try {
        const prompt = `Based on this document description: "${uploadData.description}" for subject: "${uploadData.subject}", generate 3-5 relevant tags for educational materials. Return ONLY a JSON array of tag strings, e.g. ["tag1","tag2"]. Keep tags short, relevant to education, and use hyphens for multi-word tags.`;
        
        const aiResponse = await generateText(prompt);
        
        if (aiResponse && !aiResponse.error) {
          const text = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonMatch = text.match(/\[.*\]/s);
          if (jsonMatch) {
            try {
              aiTags = JSON.parse(jsonMatch[0]);
            } catch (e) {
              aiTags = text.split(/[\n,]+/)
                .map(tag => tag.trim().replace(/[^\w\s-]/g, '').toLowerCase())
                .filter(tag => tag.length > 0)
                .slice(0, 5);
            }
          }
        }
      } catch (error) {
        console.warn('AI tagging failed, using fallback tags:', error);
      }

      if (!aiTags.length) {
        aiTags = [
          uploadData.subject.toLowerCase().replace(/\s+/g, '-'),
          'study-material',
          'notes',
          uploadData.courseCode?.toLowerCase() || 'course'
        ].filter(Boolean);
      }

      // Create a permanent file URL for download
      const fileUrl = URL.createObjectURL(uploadData.file);

      const newFile = {
        id: Date.now().toString(),
        name: uploadData.file.name,
        type: uploadData.file.type,
        size: uploadData.file.size,
        uploadDate: new Date().toLocaleDateString(),
        subject: uploadData.subject,
        courseCode: uploadData.courseCode.toUpperCase(),
        unit: uploadData.unit,
        description: uploadData.description,
        uploadedBy: user.id,
        uploadedByName: user.name,
        rating: 0,
        ratings: [],
        downloads: 0,
        tags: aiTags,
        preview: fileUrl,
        fileUrl: fileUrl,
        folder: uploadData.subject.toLowerCase().replace(/\s+/g, '-'),
        unitFolder: `unit-${uploadData.unit}`,
        fileData: uploadData.file
      };

      onUpload(newFile);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-3xl p-8 w-full max-w-2xl border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
            Upload New Material
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleFileUpload} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
              <select
                value={uploadData.subject}
                onChange={(e) => setUploadData(prev => ({...prev, subject: e.target.value}))}
                className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-primary-400"
                required
              >
                <option value="">Select Subject</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Software Engineering">Software Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Course Code</label>
              <input
                type="text"
                value={uploadData.courseCode}
                onChange={(e) => setUploadData(prev => ({...prev, courseCode: e.target.value.toUpperCase()}))}
                className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                placeholder="e.g., CS301"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Unit *</label>
              <select
                value={uploadData.unit}
                onChange={(e) => setUploadData(prev => ({...prev, unit: e.target.value}))}
                className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-primary-400"
                required
              >
                <option value="">Select Unit</option>
                <option value="1">Unit 1</option>
                <option value="2">Unit 2</option>
                <option value="3">Unit 3</option>
                <option value="4">Unit 4</option>
                <option value="5">Unit 5</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({...prev, description: e.target.value}))}
              rows="3"
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
              placeholder="Describe what this material contains..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">File *</label>
            <input
              type="file"
              onChange={(e) => setUploadData(prev => ({...prev, file: e.target.files[0]}))}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-dark-700 text-gray-300 rounded-xl font-bold hover:bg-dark-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl font-bold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Upload Section Component - ORIGINAL with guest check
function UploadSection({ onUpload, isGuest }) {
  if (isGuest) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
            Guest Mode Restricted
          </h2>
          <p className="text-xl text-gray-300 mb-8">Please sign in to upload materials and help your peers</p>
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl max-w-md mx-auto">
            <p className="text-yellow-400">
              Guest users can browse files but cannot upload, download, or rate materials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
          Share Your Knowledge
        </h2>
        <p className="text-xl text-gray-300 mb-8">Upload notes, assignments, and resources to help your peers</p>
        
        <button
          onClick={onUpload}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl font-bold text-white hover:scale-105 transition-transform shadow-lg text-lg"
        >
          <Upload className="w-6 h-6 mr-3" />
          Upload New Material
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: <Star className="h-8 w-8" />, title: "AI-Powered Tagging", desc: "Automatic categorization using Gemini AI" },
          { icon: <TrendingUp className="h-8 w-8" />, title: "Earn Reputation", desc: "Gain points for helpful uploads" },
          { icon: <Users className="h-8 w-8" />, title: "Help Peers", desc: "Contribute to campus learning community" }
        ].map((feature, index) => (
          <div key={index} className="bg-dark-800/50 rounded-2xl p-6 text-center border border-purple-500/20 hover:border-primary-400/50 transition-all">
            <div className="text-primary-400 mb-4 inline-block p-3 bg-primary-500/10 rounded-xl">
              {feature.icon}
            </div>
            <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
            <p className="text-gray-400 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Browse Section with Google Drive-style Folder Structure
// Enhanced Browse Section with Google Drive-style Folder Structure
function BrowseSection({ 
  files, user, isGuest, onFileUpdate, onPreviewFile, 
  folders, currentFolder, breadcrumbs, 
  onNavigateToFolder, onNavigateToBreadcrumb,
  setCurrentFolder,
  setBreadcrumbs
})  {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [viewMode, setViewMode] = useState('folders');
  const [expandedSubject, setExpandedSubject] = useState(null);

  const handleRateFile = (fileId, rating) => {
    if (isGuest) {
      alert('Please sign in to rate files');
      return;
    }
    onFileUpdate(prev => prev.map(file => {
      if (file.id === fileId) {
        const userRating = file.ratings?.find(r => r.userId === user.id);
        const newRatings = userRating 
          ? file.ratings.map(r => r.userId === user.id ? {...r, rating} : r)
          : [...(file.ratings || []), { userId: user.id, rating }];
        
        const avgRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
        
        return {
          ...file,
          ratings: newRatings,
          rating: Math.round(avgRating * 10) / 10
        };
      }
      return file;
    }));
  };

  const handleDownload = (fileId) => {
  if (isGuest) {
    alert('Please sign in to download files');
    return;
  }
  
  // Find the file to download
  const fileToDownload = files.find(file => file.id === fileId);
  if (!fileToDownload) {
    alert('File not found');
    return;
  }

  // Update download count
  onFileUpdate(prev => prev.map(file => 
    file.id === fileId ? { ...file, downloads: file.downloads + 1 } : file
  ));

  // Create a temporary anchor element to trigger download
  const link = document.createElement('a');
  link.href = fileToDownload.fileUrl || fileToDownload.preview;
  link.download = fileToDownload.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert('Download started!');
};

  const handleDeleteFile = (fileId) => {
  if (isGuest) {
    alert('Guest users cannot delete files');
    return;
  }
  if (window.confirm('Are you sure you want to delete this file?')) {
    // Remove the file from the files array
    onFileUpdate(prev => prev.filter(file => file.id !== fileId));
    
    // Force refresh the folder structure by navigating back to current folder
    // This ensures the UI updates immediately
    if (currentFolder) {
      const updatedFolders = organizeFilesBySubjectAndUnit(files.filter(file => file.id !== fileId));
      const updatedRootFolder = createFolderStructure(updatedFolders);
      
      // If we're in a specific folder, we need to find and update it
      if (currentFolder.id !== 'root') {
        // Find the current folder in the updated structure
        let targetFolder = null;
        
        if (currentFolder.id.startsWith('subject-')) {
          // We're in a subject folder
          targetFolder = updatedRootFolder.children?.find(
            child => child.id === currentFolder.id
          );
        } else if (currentFolder.id.startsWith('unit-')) {
          // We're in a unit folder - need to find the parent subject first
          const subjectId = currentFolder.id.split('-').slice(0, 2).join('-');
          const subjectFolder = updatedRootFolder.children?.find(
            child => child.id === subjectId
          );
          targetFolder = subjectFolder?.children?.find(
            child => child.id === currentFolder.id
          );
        }
        
        if (targetFolder) {
          setCurrentFolder(targetFolder);
        } else {
          // If folder no longer exists, go to root
          setCurrentFolder(updatedRootFolder);
          setBreadcrumbs([updatedRootFolder]);
        }
      }
    }
    
    alert('File deleted successfully!');
  }
};
  // Get current folder contents for folder view
  const getCurrentFolderContents = () => {
    if (!currentFolder) return [];
    
    if (currentFolder.id === 'root') {
      return currentFolder.children || [];
    }
    
    if (currentFolder.children) {
      return currentFolder.children;
    }
    
    if (currentFolder.files) {
      // Apply search filter to files in current folder
      return currentFolder.files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSubject = !selectedSubject || file.subject === selectedSubject;
        return matchesSearch && matchesSubject;
      });
    }
    
    return [];
  };

  const currentContents = getCurrentFolderContents();
  const subjects = [...new Set(files.map(file => file.subject))];
  
  // Filter files for "All Files" view
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || file.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Check if we should show "no results" message
  const showNoResults = (viewMode === 'files' && filteredFiles.length === 0) || 
                       (viewMode === 'folders' && currentContents.length === 0);

  return (
    <div>
      {/* Breadcrumb Navigation - remains the same */}
      <div className="flex items-center space-x-2 mb-6 text-sm text-gray-400">
        <button
          onClick={() => onNavigateToBreadcrumb(0)}
          className="flex items-center space-x-1 hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>
        {breadcrumbs.slice(1).map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight className="h-4 w-4" />
            <button
              onClick={() => onNavigateToBreadcrumb(index + 1)}
              className="hover:text-white transition-colors truncate max-w-32"
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Search and Filters - remains the same */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search notes, subjects, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-dark-800 border border-purple-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
            />
          </div>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-4 bg-dark-800 border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:border-primary-400"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle - remains the same */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setViewMode('folders')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              viewMode === 'folders' 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4 inline mr-2" />
            Folder View
          </button>
          <button
            onClick={() => setViewMode('files')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              viewMode === 'files' 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            All Files
          </button>
        </div>
      </div>

      {/* Guest Mode Notice - remains the same */}
      {isGuest && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
          <p className="text-yellow-400 text-center">
            <strong>Guest Mode:</strong> You can browse files but cannot download, rate, or upload. Sign in for full access.
          </p>
        </div>
      )}

      {/* Files/Folders Display - UPDATED */}
      {showNoResults ? (
        <div className="text-center py-20">
          <div className="p-6 bg-dark-800/50 rounded-3xl inline-block mb-6">
            <BookOpen className="h-16 w-16 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-400 mb-4">No documents found</h3>
          <p className="text-gray-500">Try adjusting your search or upload the first resource!</p>
        </div>
      ) : viewMode === 'folders' ? (
        // Enhanced Folder View with Google Drive Style - NOW FILTERED
        <div className="space-y-4">
          {currentFolder.id === 'root' ? (
            // Root folder - show subjects (filtered by search)
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentContents.map((subjectFolder) => (
                <div
                  key={subjectFolder.id}
                  className="bg-dark-800/50 rounded-2xl p-6 border border-purple-500/20 hover:border-primary-400/50 transition-all hover:scale-105 cursor-pointer group"
                  onClick={() => onNavigateToFolder(subjectFolder)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-primary-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                      <Folder className="h-8 w-8 text-primary-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{subjectFolder.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {subjectFolder.children?.length || 0} units
                    </p>
                    <div className="mt-3 px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-400">
                      Subject Folder
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentFolder.children ? (
            // Subject folder - show units (filtered by search)
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentContents.map((unitFolder) => (
                <div
                  key={unitFolder.id}
                  className="bg-dark-800/50 rounded-2xl p-6 border border-purple-500/20 hover:border-primary-400/50 transition-all hover:scale-105 cursor-pointer group"
                  onClick={() => onNavigateToFolder(unitFolder)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-accent-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                      <Folder className="h-8 w-8 text-accent-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{unitFolder.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {unitFolder.files?.length || 0} files
                    </p>
                    <div className="mt-3 px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-400">
                      Unit Folder
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Unit folder - show files (NOW FILTERED)
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentContents.map((file) => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  user={user}
                  isGuest={isGuest}
                  onRate={handleRateFile}
                  onDownload={handleDownload}
                  onDelete={handleDeleteFile}
                  onPreview={onPreviewFile}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // All Files View (Original) - NOW FILTERED
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map(file => (
            <FileCard 
              key={file.id} 
              file={file} 
              user={user}
              isGuest={isGuest}
              onRate={handleRateFile}
              onDownload={handleDownload}
              onDelete={handleDeleteFile}
              onPreview={onPreviewFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// File Card Component - ORIGINAL with guest restrictions
function FileCard({ file, user, isGuest, onRate, onDownload, onDelete, onPreview }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const userRating = file.ratings?.find(r => r.userId === user.id)?.rating || 0;

  const handleAction = (action) => {
    if (isGuest && (action === 'rate' || action === 'download' || action === 'delete' || action === 'favorite')) {
      alert('Please sign in to perform this action');
      return true; // Action blocked
    }
    return false; // Action allowed
  };

  const handleDownloadClick = () => {
    if (!handleAction('download')) {
      onDownload(file.id);
    }
  };

  const handleDeleteClick = () => {
    if (!handleAction('delete')) {
      onDelete(file.id);
    }
  };

  // Check if current user can delete this file
  const canDelete = (user.id === file.uploadedBy || user.role === 'admin') && !isGuest;

  return (
    <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-2xl p-6 border border-purple-500/20 hover:border-primary-400/50 transition-all hover:scale-105">
      {/* File Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary-500/10 rounded-xl">
          <BookOpen className="h-6 w-6 text-primary-400" />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (!handleAction('favorite')) setIsFavorite(!isFavorite);
            }}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-red-400'
            } ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isGuest}
          >
            <Star className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
              title="Delete file"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* File Info */}
      <h3 className="font-bold text-lg mb-2 truncate">{file.name}</h3>
      <p className="text-primary-400 text-sm font-medium mb-1">{file.subject}</p>
      {file.courseCode && <p className="text-gray-400 text-sm mb-2">{file.courseCode}</p>}
      {file.unit && (
        <p className="text-accent-400 text-sm mb-1">Unit {file.unit}</p>
      )}
      <p className="text-gray-400 text-sm mb-4">By {file.uploadedByName}</p>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{file.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {file.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              onClick={() => {
                if (!handleAction('rate')) onRate(file.id, star);
              }}
              className={`text-sm ${
                star <= userRating ? 'text-yellow-400' : 'text-gray-400'
              } hover:text-yellow-300 ${isGuest ? 'cursor-not-allowed' : ''}`}
              disabled={isGuest}
            >
              ★
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-400">({file.rating || 0})</span>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>{file.downloads}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          {file.type === 'application/pdf' && (
            <button 
              onClick={() => onPreview(file)}
              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
              title="Preview PDF"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={handleDownloadClick}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              isGuest 
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' 
                : 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/20'
            }`}
            disabled={isGuest}
          >
            {isGuest ? 'Sign In to Download' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
// PDF Chatbot Component - ORIGINAL
function PDFChatbot({ file, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message and file context
  useEffect(() => {
    if (file) {
      setMessages([
        {
          id: 1,
          text: `Hello! I'm your study assistant for "${file.name}". I can help you summarize this document, answer questions about it, or generate a quiz based on its content. How can I assist you?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [file]);

  const extractTextFromResponse = (response) => {
    if (!response) {
      return 'No response received from AI service.';
    }
    
    if (response.error) {
      return `Error: ${response.error}. Please check your API key and try again.`;
    }
    
    // Try different response formats
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      }
      if (candidate.output) {
        return candidate.output;
      }
    }
    
    if (response.text) {
      return response.text;
    }
    
    console.log('Unexpected response format:', response);
    return 'I received an unexpected response format. Please try again.';
  };

  const handleQuickAction = async (action) => {
    setIsLoading(true);
    
    let prompt = '';
    switch (action) {
      case 'summarize':
        prompt = `Please provide a comprehensive summary of the document "${file.name}" about ${file.subject}. Focus on key concepts, main topics, and important details. The document description is: "${file.description}". Provide the summary in clear, organized sections.`;
        break;
      case 'quiz':
        prompt = `Generate a 5-question quiz based on the document "${file.name}" about ${file.subject}. The document description is: "${file.description}". Create multiple-choice questions with 4 options each and indicate the correct answer. Format it clearly.`;
        break;
      case 'keypoints':
        prompt = `Extract the key points and main ideas from the document "${file.name}" about ${file.subject}. The document description is: "${file.description}". Present them as bullet points in a logical order.`;
        break;
    }

    try {
      const response = await generateText(prompt);
      const botResponse = extractTextFromResponse(response);

      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date(),
          isQuickAction: true
        }
      ]);
    } catch (error) {
      console.error('Quick action error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: `Error: ${error.message}. Please check your API key and try again.`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create context-aware prompt
      const contextPrompt = `You are a study assistant helping with the document "${file.name}" about ${file.subject}. 
      Document description: "${file.description}"
      User's question: "${inputMessage}"
      
      Please provide a helpful, accurate response based on the document's context. If the question requires specific information from the document that isn't in the description, suggest reviewing the relevant sections.`;

      const response = await generateText(contextPrompt);
      const botResponse = extractTextFromResponse(response);

      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: `Error: ${error.message}. Please check your connection and API key.`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-800 border-l border-purple-500/20">
      {/* Chat Header */}
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Study Assistant</h3>
              <p className="text-sm text-gray-400 truncate max-w-xs">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Quick Action Tabs */}
        <div className="flex space-x-1 mt-3 bg-dark-700 rounded-lg p-1">
          {[
            { id: 'chat', label: 'Chat', icon: User },
            { id: 'summarize', label: 'Summarize', icon: BookOpen },
            { id: 'quiz', label: 'Generate Quiz', icon: FileQuestion },
            { id: 'keypoints', label: 'Key Points', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'chat') {
                  handleQuickAction(tab.id);
                }
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.sender === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-100 border border-purple-500/20'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {message.sender === 'bot' ? (
                  <Bot className="h-4 w-4 text-primary-400" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
                <span className="text-sm font-medium">
                  {message.sender === 'bot' ? 'Study Assistant' : 'You'}
                </span>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="whitespace-pre-wrap text-sm">{message.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl p-4 bg-dark-700 border border-purple-500/20">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-primary-400" />
                <span className="text-sm font-medium">Study Assistant</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-purple-500/20">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question about this document..."
            className="flex-1 px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

// PDF Preview Modal Component with Chatbot - ORIGINAL with guest check
function PDFPreviewModal({ file, onClose, isGuest }) {
  const [showChatbot, setShowChatbot] = useState(false);

  const handleDownload = () => {
    if (isGuest) {
      alert('Please sign in to download files');
      return;
    }

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = file.fileUrl || file.preview;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Download started!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-3xl w-full max-w-7xl h-[95vh] flex border border-purple-500/30">
        {/* PDF Viewer */}
        <div className={`${showChatbot ? 'w-2/3' : 'w-full'} flex flex-col transition-all duration-300`}>
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-bold text-white">Preview: {file.name}</h3>
              {!isGuest && (
                <button
                  onClick={() => setShowChatbot(!showChatbot)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-medium hover:scale-105 transition-transform"
                >
                  <Bot className="h-4 w-4" />
                  <span>{showChatbot ? 'Hide Assistant' : 'Show Assistant'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!isGuest && (
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 bg-accent-500/10 text-accent-400 rounded-xl hover:bg-accent-500/20 transition-colors"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Download
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex-1 p-6">
            {file.type === 'application/pdf' ? (
              <iframe
                src={file.fileUrl || file.preview}
                className="w-full h-full rounded-xl border border-purple-500/20"
                title={file.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <FileText className="h-16 w-16 mb-4" />
                <p>Preview not available for this file type</p>
              </div>
            )}
          </div>
        </div>

        {/* Chatbot Sidebar */}
        {showChatbot && !isGuest && (
          <div className="w-1/3 flex flex-col">
            <PDFChatbot file={file} onClose={() => setShowChatbot(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
// Profile Section Component - ORIGINAL with guest indicator
function ProfileSection({ user, files, isGuest }) {
  const userFiles = files.filter(file => file.uploadedBy === user.id);
  const totalDownloads = userFiles.reduce((sum, file) => sum + file.downloads, 0);
  const avgRating = userFiles.length > 0 
    ? userFiles.reduce((sum, file) => sum + (file.rating || 0), 0) / userFiles.length 
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-dark-800/50 rounded-3xl p-8 border border-purple-500/20 mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full p-1">
            <div className="w-full h-full bg-dark-800 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-primary-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="text-3xl font-bold">{user.name}</h2>
              {user.role === 'admin' && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Admin
                </span>
              )}
              {user.role === 'student' && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  Student
                </span>
              )}
              {isGuest && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  Guest Mode
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-2">{user.email}</p>
            <p className="text-primary-400">
              {user.department} • Semester {user.semester}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent-500 mb-1">{user.reputation}</div>
            <div className="text-sm text-gray-400">Reputation</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Uploads", value: userFiles.length, color: "text-primary-400" },
          { label: "Total Downloads", value: totalDownloads, color: "text-accent-400" },
          { label: "Average Rating", value: avgRating.toFixed(1), color: "text-green-400" },
          { label: "Member Since", value: new Date(user.joinedDate).getFullYear(), color: "text-purple-400" }
        ].map((stat, index) => (
          <div key={index} className="bg-dark-800/50 rounded-2xl p-6 text-center border border-purple-500/20">
            <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* User's Uploads */}
      <div>
        <h3 className="text-2xl font-bold mb-6">My Uploads ({userFiles.length})</h3>
        {userFiles.length === 0 ? (
          <div className="text-center py-12 bg-dark-800/50 rounded-2xl border border-purple-500/20">
            <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">You haven't uploaded any materials yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {userFiles.map(file => (
              <div key={file.id} className="bg-dark-800/50 rounded-2xl p-6 border border-purple-500/20">
                <h4 className="font-bold text-lg mb-2">{file.name}</h4>
                <p className="text-primary-400 text-sm mb-2">{file.subject}</p>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Downloads: {file.downloads}</span>
                  <span>Rating: {file.rating || 'No ratings'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Section Component - ORIGINAL with guest restriction
function SettingsSection({ user, onUserUpdate, isGuest }) {
  const [settings, setSettings] = useState({
    name: user.name,
    email: user.email,
    department: user.department,
    semester: user.semester,
    notifications: true,
    darkMode: true,
    emailUpdates: false
  });

  if (isGuest) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-800/50 rounded-2xl p-8 border border-purple-500/20 text-center">
          <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-400 mb-4">Settings Unavailable</h2>
          <p className="text-gray-500 mb-6">
            Guest users cannot modify settings. Please sign in to access account settings.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    const updatedUser = { 
      ...user, 
      name: settings.name,
      email: settings.email,
      department: settings.department,
      semester: settings.semester
    };
    onUserUpdate(updatedUser);
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="h-8 w-8 text-primary-400" />
        <h2 className="text-3xl font-bold">User Settings</h2>
      </div>
      
      <div className="bg-dark-800/50 rounded-2xl p-8 border border-purple-500/20">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings(prev => ({...prev, name: e.target.value}))}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-primary-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings(prev => ({...prev, email: e.target.value}))}
              className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <select
                value={settings.department}
                onChange={(e) => setSettings(prev => ({...prev, department: e.target.value}))}
                className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-primary-400"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
              <select
                value={settings.semester}
                onChange={(e) => setSettings(prev => ({...prev, semester: e.target.value}))}
                className="w-full px-4 py-3 bg-dark-700 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-primary-400"
              >
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-purple-500/20">
            <h4 className="font-medium text-gray-300">Preferences</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-300">Push Notifications</div>
                <div className="text-sm text-gray-400">Receive updates about new materials</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings(prev => ({...prev, notifications: e.target.checked}))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-300">Email Updates</div>
                <div className="text-sm text-gray-400">Get weekly digest of new content</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailUpdates}
                  onChange={(e) => setSettings(prev => ({...prev, emailUpdates: e.target.checked}))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-300">Dark Mode</div>
                <div className="text-sm text-gray-400">Better for late night study sessions</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings(prev => ({...prev, darkMode: e.target.checked}))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl font-bold text-white hover:scale-105 transition-transform mt-6"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Section Component - ORIGINAL
function AdminSection({ users, files, onUsersUpdate, onFilesUpdate }) {
  const stats = {
    totalUsers: users.length,
    totalFiles: files.length,
    totalDownloads: files.reduce((sum, file) => sum + file.downloads, 0),
    activeToday: users.length // Simplified
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      onUsersUpdate(prev => prev.filter(user => user.id !== userId));
      onFilesUpdate(prev => prev.filter(file => file.uploadedBy !== userId));
    }
  };

  const handleDeleteFile = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      onFilesUpdate(prev => prev.filter(file => file.id !== fileId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Shield className="h-8 w-8 text-purple-400" />
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Users", value: stats.totalUsers, color: "border-primary-500" },
          { label: "Total Files", value: stats.totalFiles, color: "border-accent-500" },
          { label: "Total Downloads", value: stats.totalDownloads, color: "border-green-500" },
          { label: "Active Today", value: stats.activeToday, color: "border-purple-500" }
        ].map((stat, index) => (
          <div key={index} className={`bg-dark-800/50 rounded-2xl p-6 border-l-4 ${stat.color}`}>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Users Management */}
        <div className="bg-dark-800/50 rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold mb-4">Users Management ({users.length})</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                  <div className="text-xs text-primary-400">
                    {user.department} • Sem {user.semester}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.role === 'admin' && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      Admin
                    </span>
                  )}
                  {user.role === 'student' && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Files Management */}
        <div className="bg-dark-800/50 rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold mb-4">Files Management ({files.length})</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-sm text-gray-400 truncate">{file.subject}</div>
                  <div className="text-xs text-primary-400">By {file.uploadedByName}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{file.downloads} downloads</span>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
