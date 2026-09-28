'use client';

import React, { useEffect } from 'react';
import { useDartStore } from '@/store/useDartStore';
import { HomeScreen } from '@/components/home/HomeScreen';
import { LiveMatchHUD } from '@/components/scoreboard/LiveMatchHUD';
import { MatchCreation } from '@/components/match/MatchCreation';
import { MatchSummary } from '@/components/statistics/MatchSummary';
import { PlayerManagement } from '@/components/players/PlayerManagement';
import { MatchHistory } from '@/components/history/MatchHistory';
import { PracticeMode } from '@/components/practice/PracticeMode';
import { TournamentMode } from '@/components/tournament/TournamentMode';

export default function DartlogApp() {
  const {
    currentView,
    setView,
    activeMatch,
    matchHistory,
    players,
    activePractice,
    tournaments,
    soundEnabled,
    selectedSummaryMatch,
    initStore,
    startQuickMatch,
    createNewMatch,
    inputThrow,
    undoLastDart,
    confirmActiveTurn,
    abandonMatch,
    editHistoricalTurn,
    rematch,
    createPlayer,
    removePlayer,
    startPractice,
    recordPracticeVisit,
    completePractice,
    startTournament,
    playTournamentMatch,
    toggleSound,
    setSelectedSummaryMatch,
    cloudSyncStatus,
    cloudConfigured,
    triggerCloudSync,
  } = useDartStore();

  // Initialize store and local IndexedDB on mount
  useEffect(() => {
    initStore();
  }, [initStore]);

  const activeUser = players[0] || {
    id: 'user_default',
    name: 'Ajwad',
    initials: 'AJ',
    avatarColor: '#10b981',
    createdAt: Date.now(),
  };

  const mostRecentMatch = matchHistory[0] || null;

  // View Routing
  if (currentView === 'match' && activeMatch) {
    return (
      <LiveMatchHUD
        match={activeMatch}
        soundEnabled={soundEnabled}
        onThrow={inputThrow}
        onUndo={undoLastDart}
        onConfirm={confirmActiveTurn}
        onEditTurn={(turnId, newDarts) => editHistoricalTurn(turnId, newDarts)}
        onToggleSound={toggleSound}
        onExit={abandonMatch}
      />
    );
  }

  if (currentView === 'match_create') {
    return (
      <MatchCreation
        availablePlayers={players}
        onStartMatch={createNewMatch}
        onCancel={() => setView('home')}
        onCreatePlayer={async (name) => {
          await createPlayer(name);
        }}
      />
    );
  }

  if (currentView === 'match_summary') {
    const displayMatch = selectedSummaryMatch || activeMatch || mostRecentMatch;
    if (displayMatch) {
      return (
        <MatchSummary
          match={displayMatch}
          onRematch={rematch}
          onNewMatch={() => setView('match_create')}
          onHome={() => setView('home')}
        />
      );
    }
  }

  if (currentView === 'players') {
    return (
      <PlayerManagement
        players={players}
        matches={matchHistory}
        onCreatePlayer={createPlayer}
        onDeletePlayer={removePlayer}
        onBack={() => setView('home')}
      />
    );
  }

  if (currentView === 'history') {
    return (
      <MatchHistory
        matches={matchHistory}
        onSelectMatch={(m) => {
          setSelectedSummaryMatch(m);
          setView('match_summary');
        }}
        onEditTurn={(mId, turnId, newDarts) => {
          editHistoricalTurn(turnId, newDarts);
        }}
        onBack={() => setView('home')}
      />
    );
  }

  if (currentView === 'practice') {
    return (
      <PracticeMode
        session={activePractice}
        players={players}
        onStartSession={startPractice}
        onRecordVisit={recordPracticeVisit}
        onCompleteSession={completePractice}
        onBack={() => setView('home')}
      />
    );
  }

  if (currentView === 'tournament') {
    return (
      <TournamentMode
        tournaments={tournaments}
        players={players}
        onStartTournament={startTournament}
        onPlayMatch={playTournamentMatch}
        onBack={() => setView('home')}
      />
    );
  }

  // Default Home View
  return (
    <HomeScreen
      activePlayer={activeUser}
      recentMatch={mostRecentMatch}
      soundEnabled={soundEnabled}
      cloudSyncStatus={cloudSyncStatus}
      cloudConfigured={cloudConfigured}
      onTriggerSync={triggerCloudSync}
      onQuickMatch={startQuickMatch}
      onCreateMatch={() => setView('match_create')}
      onPractice={() => setView('practice')}
      onPlayers={() => setView('players')}
      onHistory={() => setView('history')}
      onTournament={() => setView('tournament')}
      onToggleSound={toggleSound}
    />
  );
}
