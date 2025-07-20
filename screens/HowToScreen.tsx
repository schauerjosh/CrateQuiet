import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Card, Button } from '../components';
import { Colors, Layout } from '../constants';

const steps = [
  {
    title: 'Tap into Denning Instincts',
    description: `Make the crate feel like your dog’s natural “den” or safe space.\n\n• Keep crate in a calm spot.\n• Add comfy bedding and a favorite toy so your dog chooses to enter on its own.\n\nApp Use: Log crate location and add notes/photos in the app’s training session tracker.`,
  },
  {
    title: 'Introduce the “Frozen Meatical” Game',
    description: `Build a positive crate association through a high‑value treat.\n\n• Stuff a Kong (or similar) with your dog’s favorite pâté or wet food.\n• Freeze it until solid—now it’ll last for hours.\n• Only offer this frozen treat inside the closed crate.\n\nApp Use: Track treat times and add photos to your dog’s profile.`,
  },
  {
    title: 'Understand (and Break) Learned Escape Behaviors',
    description: `Dogs learn that whining, barking or crying ⇒ door opens.\n\n• Don’t reward noise with freedom.\n\nApp Use: Monitor crate sounds in real time. The app tracks barks/whines and helps you avoid rewarding noise.`,
  },
  {
    title: 'Use the “Tap & Shush” Correction',
    description: `Interrupt obnoxious noise without harm.\n\n• As soon as any bark/whine starts, tap gently on the crate top and say “shush.”\n• Repeat consistently—your dog will soon realize noise brings only a harmless surprise, not an open door.\n\nApp Use: Use the app’s bark detection and vibration feature to reinforce corrections (vibration triggers every 5th bark).`,
  },
  {
    title: 'Reward Calmness with “Airdrop” Treats',
    description: `Reinforce settling and quiet behavior.\n\n• Track silence intervals inside the crate.\n• After X seconds of quiet, sprinkle a few kibble pieces or treats through the crate bars.\n• Praise or give a quick tap on your phone’s “Reward” button to log the success.\n\nApp Use: Use the app’s session tracker to log calm intervals and reward events.`,
  },
  {
    title: 'Gradually Add Time & Distance',
    description: `Proof calm behavior when you move away.\n\n• Start with short breaks: move across the room for 5–10 seconds, return, and deliver a reward if still quiet.\n• Increase to 20–30 s, then 60 s, popping in and out as needed—always rewarding calm.\n\nApp Use: Log session durations and progress in the app’s analytics dashboard.`,
  },
  {
    title: 'Soothing Audio for Longer Absences',
    description: `Provide comfort when you’re out of sight.\n\n• Play a low‑volume podcast or ambient track on a speaker—dogs find human voices soothing.\n\nApp Use: Enable background audio playback in the app’s settings for soothing sounds.`,
  },
  {
    title: 'Long‑Line (Distance) Crate Challenge',
    description: `Keep correction consistent even when you leave.\n\n• Attach a light leash or line to the crate front.\n• Run it into the next room and clip to a fixed point.\n• If barking resumes, rattle the crate via the leash—mimics your “tap” even at a distance.\n\nApp Use: Use remote monitoring and notifications to stay consistent with corrections.`,
  },
];

export const HowToScreen: React.FC = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
      <Text style={styles.header}>CrateQuiet How-To Guide</Text>
      {steps.map((step, idx) => (
        <Card key={idx} style={styles.card}>
          <Text style={styles.title}>{`${idx + 1}. ${step.title}`}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </Card>
      ))}
      <View style={styles.footer}>
        <Text style={styles.footerText}>All features described are available in the CrateQuiet app. Use the Monitor, Progress, and Settings tabs to access them.</Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.lg,
  },
  header: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  description: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: Layout.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});
