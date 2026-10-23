import React, { useState } from 'react';
import { AppLayout, ANETab } from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { CharacterSheetView } from './components/character/CharacterSheetView';
import { DiceRollerView } from './components/dice/DiceRollerView';
import { AuthScreen } from './components/auth/AuthScreen';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { useCampaigns } from './hooks/useCampaigns';

export function App() {
  const [activeTab, setActiveTab] = useState<ANETab>('resumo');

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-main text-text-main flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Verificando credenciais no Supabase...
      </div>
    );
  }

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
      {activeTab === 'resumo' && (
        <DashboardView
          campaigns={campaigns}
          characters={characters}
          currentUserId={user.id}
          onGoToCampaigns={() => setActiveTab('campanhas')}
          onGoToFichas={() => setActiveTab('fichas')}
          onGoToDados={() => setActiveTab('dados')}
        />
      )}

      {activeTab === 'campanhas' && (
        <CampaignsView
          campaigns={campaigns}
          characters={characters}
          currentUserId={user.id}
          onCreateCampaign={createCampaign}
          onDeleteCampaign={deleteCampaign}
          onJoinCampaign={joinCampaignByCode}
          onCreateCharacter={createCharacter}
          onUpdateCharacter={updateCharacter}
          onDeleteCharacter={deleteCharacter}
        />
      )}

      {activeTab === 'fichas' && (
        <CharacterSheetView
          characters={characters}
          campaigns={campaigns}
          onUpdateCharacter={updateCharacter}
          onCreateCharacter={createCharacter}
          onDeleteCharacter={deleteCharacter}
        />
      )}

      {activeTab === 'dados' && (
        <DiceRollerView characters={characters} />
      )}
    </AppLayout>
  );
}

export default App;
