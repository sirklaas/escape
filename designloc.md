# Location Page Design Requirements

The following requirements are derived from the user feedback on the "loc page" screenshot:

## Header Section
- [ ] Remove the white pill background (previously `bg-white/95 backdrop-blur-xl`).
- [ ] Remove the word "BESTEMMING".
- [ ] Lower the location code display by 20px.

## Map Section
- [ ] Set map margins to exactly 20px from the left and right edges of the container.
- [ ] Remove the "↗ OPEN GOOGLE MAPS APP" button/link under the map.

## Action Button ("IK BEN ER")
- [ ] Set height to match other standard buttons (e.g., 56px / `h-14`).
- [ ] Apply a gradient background: blue to dark blue (e.g., `bg-gradient-to-b from-[#004e92] to-[#000428]`).
- [ ] Set text to "ik ben er" (lowercase).
- [ ] Set font to "Barlow Semi Condensed" with a weight of 300 (light).

## Animations
- [ ] Ensure all popups (alerts for correct/wrong answers) use the standard "fluent-slide-up" animation.
