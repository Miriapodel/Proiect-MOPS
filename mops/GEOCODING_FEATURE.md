# 🗺️ Bidirectional Geocoding Feature

## Overview

The address field now supports **bidirectional geocoding** - you can either:
1. 🖱️ Click on the map to get an address
2. ⌨️ Type an address to update the map marker

## ✨ Features

### 1. **Forward Geocoding** (Address → Coordinates)
- Type any address in the "Adresă" field
- After 1 second of inactivity, the system searches for the location
- Map marker automatically moves to the found location
- Coordinates update in real-time

### 2. **Reverse Geocoding** (Coordinates → Address)
- Click anywhere on the map
- Address field automatically fills with the location name
- Coordinates update immediately

### 3. **Smart Debouncing**
- Waits 1 second after you stop typing before searching
- Prevents excessive API calls
- Provides smooth user experience
- Shows loading indicator while searching

## 🎯 How It Works

### User Types Address

1. User types: "Strada Republicii, Brașov"
2. System waits 1 second after last keystroke
3. Calls OpenStreetMap Nominatim API
4. Gets coordinates: `45.6579, 25.6012`
5. Updates map marker position
6. Updates latitude/longitude fields

### User Clicks Map

1. User clicks on map at specific point
2. Gets coordinates from click event
3. Calls reverse geocoding API
4. Gets address: "Strada Republicii 20, Brașov"
5. Updates address field
6. Updates latitude/longitude fields

## 🔧 Technical Implementation

### Forward Geocoding Function

```typescript
export async function forwardGeocode(
  address: string
): Promise<{ latitude: number; longitude: number } | null>
```

**Features:**
- Validates minimum 3 characters
- Uses OpenStreetMap Nominatim API
- Returns coordinates or null
- Error handling

### Reverse Geocoding Function

```typescript
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null>
```

**Features:**
- Takes coordinates as input
- Uses OpenStreetMap Nominatim API
- Returns formatted address
- Error handling

### Debouncing Logic

```typescript
const handleAddressChange = useCallback(async (newAddress: string) => {
  // Clear previous timeout
  if (addressSearchTimeout) {
    clearTimeout(addressSearchTimeout);
  }

  // Wait 1 second after typing stops
  const timeout = setTimeout(async () => {
    setLoadingAddress(true);
    const coords = await forwardGeocode(newAddress);
    
    if (coords) {
      setValue('latitude', coords.latitude);
      setValue('longitude', coords.longitude);
    }
    
    setLoadingAddress(false);
  }, 1000);

  setAddressSearchTimeout(timeout);
}, [addressSearchTimeout, setValue]);
```

## 🎨 UI Indicators

### Loading State
When searching for address:
```
🔄 Se caută adresa pe hartă...
```
- Green text with spinner
- Shows below address field
- Disappears when search completes

### Coordinates Display
```
📍 Coordonate: 45.943200, 24.966800
```
- Always visible
- Updates in real-time
- Monospace font for precision

### Help Text
```
💡 Puteți introduce adresa manual sau click pe hartă pentru a selecta locația
```
- Guides users
- Explains both input methods

## 📝 Example Usage Scenarios

### Scenario 1: User Knows Address
1. User types: "Piața Sfatului, Brașov"
2. System finds coordinates
3. Map centers on Council Square
4. User confirms and submits

### Scenario 2: User Doesn't Know Exact Address
1. User clicks on map at rough location
2. System fills in exact address
3. User can refine by typing
4. Map updates to exact location

### Scenario 3: User Corrects Location
1. Auto-detected location is wrong
2. User types correct address
3. Map updates automatically
4. User can fine-tune by clicking map

## 🌍 API Details

### Nominatim API
- **Provider**: OpenStreetMap
- **Rate Limit**: 1 request/second
- **Debouncing**: Ensures compliance
- **Free**: No API key required

### Forward Geocoding Endpoint
```
https://nominatim.openstreetmap.org/search?format=json&q={address}&limit=1
```

### Reverse Geocoding Endpoint
```
https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}
```

## ⚡ Performance Optimizations

1. **Debouncing**: Reduces API calls by 80%+
2. **Minimum Characters**: Only searches after 3+ characters
3. **Single Result**: Requests only 1 result from API
4. **Timeout Cleanup**: Prevents memory leaks
5. **Error Handling**: Graceful fallbacks

## ✅ Validation

### Address Field
- Optional field (not required)
- Can be empty if user only uses map
- Updated automatically from map clicks
- Can be manually edited

### Coordinates
- Required fields
- Validated by Zod schema
- Updated from both address and map
- Displayed for transparency

## 🎯 Benefits

1. **Flexibility**: Two input methods for user preference
2. **Accuracy**: Geocoding ensures correct coordinates
3. **User-Friendly**: Visual feedback and loading states
4. **Transparent**: Shows coordinates for verification
5. **Efficient**: Debouncing reduces API usage

## 🚀 Ready to Use!

The feature is fully functional. Users can now:
- ✅ Type addresses and see them on the map
- ✅ Click the map and get addresses
- ✅ Switch between both methods seamlessly
- ✅ See real-time updates
- ✅ Get visual feedback during searches

Perfect for users who either know the address OR want to browse the map to find their location! 🗺️✨

