import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock, Calendar, TrendingDown, ArrowLeft } from "lucide-react-native";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";

export default function SessionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { sessions } = useApp();
  
  const session = sessions.find(s => s.id === id);
  
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
  
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const formatEventTime = (timeString: string) => {
    const eventTime = new Date(timeString);
    return eventTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Calculate time between barks (if multiple barks)
  const barkEvents = session.events.filter(e => e.type === 'bark');
  const timeBetweenBarks = barkEvents.length > 1 
    ? Math.round((new Date(barkEvents[barkEvents.length - 1].time).getTime() - 
                 new Date(barkEvents[0].time).getTime()) / (barkEvents.length - 1) / 1000)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Details</Text>
      </View>
      
      <Image source={require("../assets/icons/Icon-Crate.png")} style={{ width: 64, height: 64, marginBottom: 16 }} />
      
      <View style={styles.dateTimeCard}>
        <View style={styles.dateTimeItem}>
          <Calendar size={20} color={Colors.primary} />
          <Text style={styles.dateTimeText}>{formattedDate}</Text>
        </View>
        <View style={styles.dateTimeItem}>
          <Clock size={20} color={Colors.primary} />
          <Text style={styles.dateTimeText}>{formattedTime}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{session.duration}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{session.barkCount}</Text>
          <Text style={styles.statLabel}>Barks</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {session.barkCount > 0 
              ? (session.barkCount / (session.duration || 1)).toFixed(1) 
              : '0'}
          </Text>
          <Text style={styles.statLabel}>Barks/Min</Text>
        </View>
      </View>
      
      {barkEvents.length > 1 && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <TrendingDown size={20} color={Colors.primary} />
            <Text style={styles.insightTitle}>Session Insights</Text>
          </View>
          
          <Text style={styles.insightText}>
            Average time between barks: {timeBetweenBarks} seconds
          </Text>
          
          <Text style={styles.insightText}>
            {timeBetweenBarks > 60 
              ? "Great progress! Your dog is showing longer periods of calm between barks."
              : "Your dog is barking frequently. Try increasing the training duration gradually."}
          </Text>
        </View>
      )}
      
      <Text style={styles.sectionTitle}>Session Timeline</Text>
      
      <View style={styles.timelineContainer}>
        {session.events.map((event, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTime}>{formatEventTime(event.time)}</Text>
              <Text style={styles.timelineEvent}>
                {event.type === 'bark' 
                  ? "Barking detected" 
                  : event.type === 'start' 
                    ? "Session started" 
                    : "Session ended"}
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.exportButton}
        onPress={() => {
          // In a real app, this would export session data
        }}
      >
        <Text style={styles.exportButtonText}>Export Session Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backIcon: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
  },
  dateTimeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
  },
  insightCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  timelineContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 4,
  },
  timelineEvent: {
    fontSize: 14,
    color: Colors.textLight,
  },
  exportButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  exportButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: "center",
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});