
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { Colors, Layout } from '../constants';
import { StorageService } from '../utils/storage';
import { TrainingSession, BarkEvent } from '../types';

export const ProgressScreen: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [barkEvents, setBarkEvents] = useState<BarkEvent[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const [sessionData, eventData] = await Promise.all([
        StorageService.getTrainingSessions(),
        StorageService.getBarkEvents(),
      ]);
      
      setSessions(sessionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setBarkEvents(eventData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredSessions = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        return sessions;
    }
    
    return sessions.filter(session => new Date(session.date) >= cutoffDate);
  };

  const getStatistics = () => {
    const filteredSessions = getFilteredSessions();
    const totalSessions = filteredSessions.length;
    const successfulSessions = filteredSessions.filter(s => s.success).length;
    const totalBarks = filteredSessions.reduce((sum, s) => sum + s.barksDetected, 0);
    const totalDuration = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
    
    return {
      totalSessions,
      successfulSessions,
      successRate: totalSessions > 0 ? Math.round((successfulSessions / totalSessions) * 100) : 0,
      totalBarks,
      averageBarks: totalSessions > 0 ? Math.round(totalBarks / totalSessions) : 0,
      totalDuration: Math.round(totalDuration / 60), // Convert to minutes
    };
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? 'checkmark-circle' : 'warning';
  };

  const getSuccessColor = (success: boolean) => {
    return success ? Colors.success : Colors.warning;
  };

  const stats = getStatistics();

  if (isLoading) {
    return (
      <LinearGradient colors={[Colors.background, Colors.backgroundLight]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading progress data...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.background, Colors.backgroundLight]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Training Progress</Text>
            <Text style={styles.subtitle}>Track your dog's crate training journey</Text>
          </View>

          {/* Period Selector */}
          <Card style={styles.periodSelector}>
            <View style={styles.periodButtons}>
              {(['week', 'month', 'all'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last Month' : 'All Time'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Statistics Overview */}
          <Card style={styles.statsCard} gradient>
            <Text style={styles.statsTitle}>Training Statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.totalSessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: Colors.success }]}>
                  {stats.successRate}%
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.averageBarks}</Text>
                <Text style={styles.statLabel}>Avg. Barks</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.totalDuration}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
            </View>
          </Card>

          {/* Recent Sessions */}
          <Card style={styles.sessionsCard}>
            <View style={styles.sessionsHeader}>
              <Text style={styles.sessionsTitle}>Recent Sessions</Text>
              <Ionicons name="time" size={20} color={Colors.primary} />
            </View>
            
            {getFilteredSessions().length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No training sessions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start monitoring to track your progress
                </Text>
              </View>
            ) : (
              <View style={styles.sessionsList}>
                {getFilteredSessions().slice(0, 10).map((session) => (
                  <View key={session.id} style={styles.sessionItem}>
                    <View style={styles.sessionIcon}>
                      <Ionicons
                        name={getSuccessIcon(session.success)}
                        size={20}
                        color={getSuccessColor(session.success)}
                      />
                    </View>
                    
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDate}>
                        {formatDate(new Date(session.date))}
                      </Text>
                      <Text style={styles.sessionDetails}>
                        {formatDuration(session.duration)} • {session.barksDetected} barks
                      </Text>
                      {session.notes && (
                        <Text style={styles.sessionNotes}>{session.notes}</Text>
                      )}
                    </View>
                    
                    <View style={styles.sessionBadge}>
                      <Text style={[
                        styles.sessionBadgeText,
                        { color: getSuccessColor(session.success) }
                      ]}>
                        {session.success ? 'Success' : 'Progress'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Achievements */}
          <Card style={styles.achievementsCard}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.achievementsTitle}>Achievements</Text>
              <Ionicons name="trophy" size={20} color={Colors.primary} />
            </View>
            
            <View style={styles.achievementsList}>
              {stats.totalSessions >= 1 && (
                <View style={styles.achievementItem}>
                  <Ionicons name="medal" size={24} color={Colors.primary} />
                  <Text style={styles.achievementText}>First Training Session</Text>
                </View>
              )}
              
              {stats.successfulSessions >= 3 && (
                <View style={styles.achievementItem}>
                  <Ionicons name="trophy" size={24} color={Colors.success} />
                  <Text style={styles.achievementText}>3 Successful Sessions</Text>
                </View>
              )}
              
              {stats.totalSessions >= 7 && (
                <View style={styles.achievementItem}>
                  <Ionicons name="ribbon" size={24} color={Colors.primary} />
                  <Text style={styles.achievementText}>Week Warrior</Text>
                </View>
              )}
              
              {stats.successRate >= 80 && stats.totalSessions >= 5 && (
                <View style={styles.achievementItem}>
                  <Ionicons name="star" size={24} color={Colors.primary} />
                  <Text style={styles.achievementText}>Training Expert</Text>
                </View>
              )}
            </View>
          </Card>

          {/* Training Tips */}
          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsTitle}>Training Tips</Text>
              <Ionicons name="bulb" size={20} color={Colors.primary} />
            </View>
            
            <View style={styles.tipsList}>
              <Text style={styles.tipText}>
                💡 Gradually increase crate time as your dog becomes more comfortable
              </Text>
              <Text style={styles.tipText}>
                🎯 Consistency is key - maintain regular training schedules
              </Text>
              <Text style={styles.tipText}>
                🏆 Celebrate small wins and progress, not just perfect sessions
              </Text>
              <Text style={styles.tipText}>
                📊 Use the data to identify patterns and optimal training times
              </Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Layout.fontSize.lg,
    color: Colors.textSecondary,
  },
  header: {
    paddingVertical: Layout.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  periodSelector: {
    marginBottom: Layout.spacing.lg,
  },
  periodButtons: {
    flexDirection: 'row',
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  periodButton: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: Layout.spacing.lg,
  },
  statsTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  statNumber: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  sessionsCard: {
    marginBottom: Layout.spacing.lg,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  sessionsTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyStateText: {
    fontSize: Layout.fontSize.lg,
    color: Colors.textMuted,
    marginTop: Layout.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
  sessionsList: {
    gap: Layout.spacing.md,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  sessionIcon: {
    marginRight: Layout.spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  sessionDetails: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  sessionNotes: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    marginTop: Layout.spacing.xs,
    fontStyle: 'italic',
  },
  sessionBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: Colors.surface,
  },
  sessionBadgeText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
  },
  achievementsCard: {
    marginBottom: Layout.spacing.lg,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  achievementsTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  achievementsList: {
    gap: Layout.spacing.md,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  achievementText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    marginLeft: Layout.spacing.md,
    fontWeight: '500',
  },
  tipsCard: {
    marginBottom: Layout.spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  tipsTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  tipsList: {
    gap: Layout.spacing.md,
  },
  tipText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
