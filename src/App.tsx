import React, { useState } from 'react';
import { AppLayout, ANETab } from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { CharacterSheetView } from './components/character/CharacterSheetView';
import { MasterControlView } from './components/master/MasterControlView';
import { AuthScreen } from './components/auth/AuthScreen';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { useCampaigns } from './hooks/useCampaigns';

export function App() {
  const [activeTab, setActiveTab] = useState<ANETab>('dashboard');

  const {
    user,
    profile,
    loading: authLoading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  } = useSupabaseAuth();

  const {
    campaigns,
    characters,
    createCampaign,
    deleteCampaign,
    joinCampaignByCode,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  } = useCampaigns(user?.id);

  // Tela de carregamento inicial da sessão
  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-main text-text-main flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Verificando credenciais no Supabase...
      </div>
    );
  }

  // Exige Login / Criar Conta antes de liberar acesso ao sistema
  if (!user) {
    return (
      <AuthScreen
        onSignIn={signInWithEmail}
        onSignUp={signUpWithEmail}
      />
    );
  }

  return (
    <AppLayout
      profile={profile}
      userEmail={user.email}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={signOut}
    >
      {activeTab === 'dashboard' && (
        <DashboardView
          campaigns={campaigns}
          characters={characters}
          currentUserId={user.id}
          onCreateCampaign={createCampaign}
          onDeleteCampaign={deleteCampaign}
          onJoinCampaign={joinCampaignByCode}
          onCreateCharacter={createCharacter}
          onDeleteCharacter={deleteCharacter}
          onOpenCharacterSheet={() => setActiveTab('characters')}
          onOpenMasterShield={() => setActiveTab('master-control')}
        />
      )}

      {activeTab === 'characters' && (
        <CharacterSheetView
          characters={characters}
          campaigns={campaigns}
          onUpdateCharacter={updateCharacter}
          onCreateCharacter={createCharacter}
        />
      )}

      {activeTab === 'master-control' && (
        <MasterControlView
          campaigns={campaigns}
          characters={characters}
          currentUserId={user.id}
          onCreateCharacter={createCharacter}
          onUpdateCharacter={updateCharacter}
          onDeleteCharacter={deleteCharacter}
        />
      )}
    </AppLayout>
  );
}

export default App;
