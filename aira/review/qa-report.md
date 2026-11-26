# Aira film — QA report

Run: 2026-11-26T14:35:18.882Z · Chromium 158.0.8127.36

## 1. Anonymisation
- E-mail addresses: 0 · phone numbers: 0 · URLs: 0 → PASS
- Capitalised words in the film (all text, all states): Accept, Aira, Alert, Body, Captured, Capturing, Cases, Chills, Contact, Cyclic, DISEASE, Data, Disease, Dismiss, District, Doe, Does, EMR, Fever, Flagged, Follow-up, Has, He, Headache, John, LIVE, Malaria, Mocuba, Now, Patient, Pending, Presenting, RDT, Reached, Recommendation, Saved, Signal, The, Treatment, Validated, Weekly, WoW, Yes
- Not on the allow-list: none → PASS
- Person / place data present: "John Doe · 64M" (dummy, as approved) · "Mocuba district" (dummy, as approved)

## 2. Forbidden terms and gradients
- `aira-film.html`: qFlow / EMR vendor names: none → PASS
  - CSS gradients: 2 (2 single-colour layers used by the qTrack highlight sweep), multi-colour: 0, SVG gradient elements: 0 → PASS
- `motion-preview-standalone.html`: qFlow / EMR vendor names: none → PASS
  - CSS gradients: 2 (2 single-colour layers used by the qTrack highlight sweep), multi-colour: 0, SVG gradient elements: 0 → PASS

## 3. Console, opened from a fresh empty folder
- `aira-film.html` (folder holds only: aira-film.html): no errors, no warnings, no failed requests → PASS
- `motion-preview-standalone.html` (folder holds only: motion-preview-standalone.html): no errors, no warnings, no failed requests → PASS

## 4. Integration hooks
- Labels: ch1 0.00 s · ch2 4.57 s · ch3 9.97 s · ch4 15.16 s · end 20.26 s · loop 21.16 s · repeat -1
- `aira:chapter` events over one loop (+ wrap): 1@0.1s, 2@4.61s, 3@10.1s, 4@15.27s, 1@0.14s → PASS
- `data-start="ch3" data-end="ch4"`: master at 11.54 s, inside [9.972, 15.16] → PASS
- Reduced motion: paused true at 8.22 s (CH2 "accepted" frame = 8.222 s) → PASS
- Pauses when scrolled out of view: true → PASS

## 5. Frame rate (1440 wide, one full loop in real time)
- Renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver) — **software renderer (no GPU in this container)**
- 1270 frames · average 60.0 fps · 95th percentile frame 16.8 ms · frames over 34 ms: 0 · worst 16.8 ms

## 6. File sizes
- `aira-film.html`: 286.4 KB
- `motion-preview-standalone.html`: 372.7 KB
- `review/aira-loop.mp4`: 1238.8 KB
- GSAP 3.13.0 (core + CustomEase, TextPlugin, DrawSVGPlugin, MotionPathPlugin) loads from jsDelivr, pinned; not counted above

**All checks passed.**
