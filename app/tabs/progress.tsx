import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, TrendingUp, Clock, Award } from "lucide-react-native";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function ProgressScreen() {
  const router = useRouter();
  const { sessions } = useApp();
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');

  const filteredSessions = React.useMemo(() => {
    const now = new Date();
    
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return sessions.filter(session => new Date(session.date) >= oneWeekAgo);
    } else if (timeFilter === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return sessions.filter(session => new Date(session.date) >= oneMonthAgo);
    }
    
    return sessions;
  }, [sessions, timeFilter]);

  const totalSessions = filteredSessions.length;
  const totalBarks = filteredSessions.reduce((sum, session) => sum + session.barkCount, 0);
  const totalDuration = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
  
  const averageBarks = totalSessions > 0 ? (totalBarks / totalSessions).toFixed(1) : '0';
  const improvementPercentage = totalSessions > 1 ? Math.min(95, Math.max(0, 100 - (totalBarks / totalSessions) * 10)) : 0;

  const renderSessionItem = ({ item }: { item: any }) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
    });
    
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <TouchableOpacity 
        style={styles.sessionItem}
        onPress={() => router.push({
          pathname: "/session-details",
          params: { id: item.id }
        })}
      >
        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sessionDate}>{formattedDate}</Text>
            <Text style={styles.sessionTime}>{formattedTime}</Text>
          </View>
          
          <View style={styles.sessionStats}>
            <View style={styles.statBadge}>
              <Clock size={14} color={Colors.primary} />
              <Text style={styles.statBadgeText}>{item.duration}m</Text>
            </View>
            
            <View style={styles.statBadge}>
              <TrendingUp size={14} color={Colors.primary} />
              <Text style={styles.statBadgeText}>{item.barkCount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['week', 'month', 'all'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, timeFilter === filter && styles.activeFilter]}
            onPress={() => setTimeFilter(filter)}
          >
            <Text style={[styles.filterText, timeFilter === filter && styles.activeFilterText]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Calendar size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <TrendingUp size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{totalBarks}</Text>
          <Text style={styles.statLabel}>Total Barks</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Award size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{averageBarks}</Text>
          <Text style={styles.statLabel}>Avg/Session</Text>
        </View>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Training Progress</Text>
          <Text style={styles.progressPercentage}>{improvementPercentage.toFixed(0)}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${improvementPercentage}%` }]} />
        </View>
        
        <Text style={styles.progressDescription}>
          {improvementPercentage > 70 
            ? "Excellent progress! Your dog is responding very well."
            : improvementPercentage > 40
              ? "Good improvement! Keep up the consistent training."
              : "Keep training! Consistency is key to success."}
        </Text>

        {/* Stats Container */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Image source={require("../../assets/icons/Icon-Chart.png")}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Sessions</Text>
            <Text style={styles.statValue}>{totalSessions}</Text>
          </View>
          <View style={styles.statBox}>
            <Image source={require("../../assets/icons/Icon-Waveform.png")}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Barks</Text>
            <Text style={styles.statValue}>{totalBarks}</Text>
          </View>
          <View style={styles.statBox}>
            <Image source={require("../../assets/icons/Icon-Bell.png")}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{totalDuration} min</Text>
          </View>
          <View style={styles.statBox}>
            <Image source={require("../../assets/icons/Icon-Checkmark.png")}
              style={styles.statIcon}
            />
            <Text style={styles.statLabel}>Improvement</Text>
            <Text style={styles.statValue}>{improvementPercentage}%</Text>
          </View>
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={styles.sessionsSection}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        
        {filteredSessions.length > 0 ? (
          <FlatList
            data={filteredSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)}
            renderItem={renderSessionItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sessions recorded yet</Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => router.push("/dog-profile")}
            >
              <Text style={styles.startButtonText}>Start Monitoring</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.textLight,
    fontWeight: "600",
    fontSize: 14,
  },
  activeFilterText: {
    color: Colors.background,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  sessionItem: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  sessionTime: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  sessionStats: {
    flexDirection: "row",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.text,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  startButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
});