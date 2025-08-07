import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Heart, Target, Activity, Users, BarChart3, MessageCircle, Settings } from 'lucide-react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setCurrentView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent setUser={setUser} authMode={authMode} setAuthMode={setAuthMode} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">AI Health Coach</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <NavButton 
                icon={BarChart3} 
                label="대시보드" 
                active={currentView === 'dashboard'}
                onClick={() => setCurrentView('dashboard')}
              />
              <NavButton 
                icon={Activity} 
                label="운동" 
                active={currentView === 'workout'}
                onClick={() => setCurrentView('workout')}
              />
              <NavButton 
                icon={Target} 
                label="영양" 
                active={currentView === 'nutrition'}
                onClick={() => setCurrentView('nutrition')}
              />
              <NavButton 
                icon={MessageCircle} 
                label="AI 코치" 
                active={currentView === 'chat'}
                onClick={() => setCurrentView('chat')}
              />
              <NavButton 
                icon={User} 
                label="프로필" 
                active={currentView === 'profile'}
                onClick={() => setCurrentView('profile')}
              />
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">안녕하세요, {user.name}님!</span>
              <button 
                onClick={logout}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && <DashboardView user={user} />}
        {currentView === 'workout' && <WorkoutView user={user} />}
        {currentView === 'nutrition' && <NutritionView user={user} />}
        {currentView === 'chat' && <ChatView user={user} />}
        {currentView === 'profile' && <ProfileView user={user} />}
      </main>
    </div>
  );
}

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-100 text-indigo-700' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const AuthComponent = ({ setUser, authMode, setAuthMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    gender: 'male'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const data = authMode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { ...formData, age: parseInt(formData.age) };

      const response = await axios.post(endpoint, data);
      
      localStorage.setItem('token', response.data.access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      setUser(response.data.user);
    } catch (error) {
      setError(error.response?.data?.detail || '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">AI Health Coach</h1>
            <p className="text-gray-600 mt-2">당신만의 AI 퍼스널 트레이너</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                authMode === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                authMode === 'register' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="이메일"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {authMode === 'register' && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="이름"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="flex space-x-4">
                  <input
                    type="number"
                    placeholder="나이"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? '처리 중...' : (authMode === 'login' ? '로그인' : '회원가입')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ user }) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        icon={Activity} 
        title="오늘 운동"
        value="0분"
        subtitle="목표: 60분"
        color="text-blue-600"
        bgColor="bg-blue-50"
      />
      <StatCard 
        icon={Target} 
        title="칼로리"
        value="0 kcal"
        subtitle="목표: 2000 kcal"
        color="text-green-600"
        bgColor="bg-green-50"
      />
      <StatCard 
        icon={Heart} 
        title="체중"
        value="-"
        subtitle="목표 설정 필요"
        color="text-purple-600"
        bgColor="bg-purple-50"
      />
      <StatCard 
        icon={BarChart3} 
        title="진척도"
        value="0%"
        subtitle="이번 주"
        color="text-orange-600"
        bgColor="bg-orange-50"
      />
    </div>

    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">시작하기</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-indigo-600" />
            <span className="font-medium">건강 프로필 설정</span>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            설정하기
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-green-600" />
            <span className="font-medium">첫 번째 운동 계획</span>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            시작하기
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <span className="font-medium">AI 코치와 대화</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            대화하기
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className={`inline-flex p-3 rounded-lg ${bgColor} mb-4`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </div>
);

const WorkoutView = ({ user }) => (
  <div className="space-y-8">
    <h1 className="text-3xl font-bold text-gray-900">운동</h1>
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">운동 기능 준비 중</h2>
      <p className="text-gray-500">곧 개인 맞춤 운동 루틴을 제공할 예정입니다!</p>
    </div>
  </div>
);

const NutritionView = ({ user }) => (
  <div className="space-y-8">
    <h1 className="text-3xl font-bold text-gray-900">영양 관리</h1>
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">영양 관리 기능 준비 중</h2>
      <p className="text-gray-500">곧 AI 기반 식단 분석을 제공할 예정입니다!</p>
    </div>
  </div>
);

const ChatView = ({ user }) => (
  <div className="space-y-8">
    <h1 className="text-3xl font-bold text-gray-900">AI 코치</h1>
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">AI 코치 준비 중</h2>
      <p className="text-gray-500">곧 24/7 AI 퍼스널 트레이너와 대화할 수 있습니다!</p>
    </div>
  </div>
);

const ProfileView = ({ user }) => (
  <div className="space-y-8">
    <h1 className="text-3xl font-bold text-gray-900">프로필</h1>
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">기본 정보</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <div className="bg-gray-50 p-3 rounded-lg">{user.name}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <div className="bg-gray-50 p-3 rounded-lg">{user.email}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">나이</label>
          <div className="bg-gray-50 p-3 rounded-lg">{user.age}세</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
          <div className="bg-gray-50 p-3 rounded-lg">
            {user.gender === 'male' ? '남성' : '여성'}
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">건강 프로필</h2>
      <div className="text-center py-8">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">건강 프로필을 설정하여 맞춤 서비스를 받아보세요</p>
        <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          프로필 설정하기
        </button>
      </div>
    </div>
  </div>
);

export default App;