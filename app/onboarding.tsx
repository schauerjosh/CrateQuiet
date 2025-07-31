import React, { useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions, Animated, Image } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";
import { OnboardingStep } from "@/types";

const { width } = Dimensions.get("window");

const onboardingSteps: OnboardingStep[] = [
	{
		id: "1",
		title: "Gentle Training",
		description: "The smart solution to help your dog feel comfortable and secure in their crate.",
		image: require("../assets/onboarding/Onboarding-GentleTraining.png"),
	},
	{
		id: "2",
		title: "Privacy & Security",
		description: "CrateQuiet listens for barking or whining and automatically responds to calm your dog.",
		image: require("../assets/onboarding/Onboarding-PrivacySecurity.png"),
	},
	{
		id: "3",
		title: "Custom Responses",
		description: "Record your own voice to create a personalized calming response for your dog.",
		image: require("../assets/icons/Icon-Microphone.png"),
	},
	{
		id: "4",
		title: "Track Progress",
		description: "Monitor your dog's improvement over time with detailed session tracking and analytics.",
		image: require("../assets/icons/Icon-Chart.png"),
	},
];

export default function OnboardingScreen() {
	const router = useRouter();
	const { completeOnboarding } = useApp();
	const [currentIndex, setCurrentIndex] = useState(0);
	const scrollX = useRef(new Animated.Value(0)).current;
	const flatListRef = useRef<FlatList>(null);

	const handleNext = () => {
		if (currentIndex < onboardingSteps.length - 1) {
			flatListRef.current?.scrollToIndex({
				index: currentIndex + 1,
				animated: true,
			});
		} else {
			handleComplete();
		}
	};

	const handleSkip = () => {
		handleComplete();
	};

	const handleComplete = async () => {
		await completeOnboarding();
		router.replace("/dog-profile");
	};

	const renderItem = ({ item }: { item: OnboardingStep }) => {
		return (
			<View style={styles.slide}>
				{typeof item.image === "number" ? (
					<Image source={item.image} style={styles.image} />
				) : null}
				<Text style={styles.title}>{item.title}</Text>
				<Text style={styles.description}>{item.description}</Text>
			</View>
		);
	};

	const renderDots = () => {
		return (
			<View style={styles.dotsContainer}>
				{onboardingSteps.map((_, index) => {
					const inputRange = [
						(index - 1) * width,
						index * width,
						(index + 1) * width,
					];

					const dotWidth = scrollX.interpolate({
						inputRange,
						outputRange: [8, 16, 8],
						extrapolate: "clamp",
					});

					const opacity = scrollX.interpolate({
						inputRange,
						outputRange: [0.3, 1, 0.3],
						extrapolate: "clamp",
					});

					return (
						<Animated.View
							key={index}
							style={[
								styles.dot,
								{ width: dotWidth, opacity },
							]}
						/>
					);
				})}
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
				<Text style={styles.skipText}>Skip</Text>
			</TouchableOpacity>

			<FlatList
				ref={flatListRef}
				data={onboardingSteps}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{ useNativeDriver: false }
				)}
				onMomentumScrollEnd={(event) => {
					const index = Math.round(
						event.nativeEvent.contentOffset.x / width
					);
					setCurrentIndex(index);
				}}
				scrollEventThrottle={16}
			/>

			{renderDots()}

			<TouchableOpacity style={styles.nextButton} onPress={handleNext}>
				<Text style={styles.nextButtonText}>
					{currentIndex === onboardingSteps.length - 1 ? "Get Started" : "Next"}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	skipButton: {
		position: "absolute",
		top: 50,
		right: 20,
		zIndex: 1,
	},
	skipText: {
		fontSize: 16,
		color: Colors.primary,
		fontWeight: "500",
	},
	slide: {
		width,
		alignItems: "center",
		padding: 40,
		paddingTop: 100,
	},
	image: {
		width: width * 0.6,
		height: width * 0.6,
		resizeMode: "contain",
		borderRadius: 20,
		marginBottom: 40,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: 16,
		textAlign: "center",
	},
	description: {
		fontSize: 16,
		color: Colors.textLight,
		textAlign: "center",
		lineHeight: 24,
	},
	dotsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 40,
	},
	dot: {
		height: 8,
		width: 8,
		borderRadius: 4,
		backgroundColor: Colors.primary,
		marginHorizontal: 4,
	},
	nextButton: {
		backgroundColor: Colors.primary,
		paddingVertical: 16,
		paddingHorizontal: 40,
		borderRadius: 30,
		marginBottom: 40,
		alignSelf: "center",
	},
	nextButtonText: {
		color: Colors.white,
		fontSize: 18,
		fontWeight: "600",
	},
});