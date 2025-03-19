"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import {
  PiArrowSquareDown,
  PiArrowSquareLeft,
  PiArrowSquareRight,
  PiNumberSquareOne,
  PiNumberSquareTwo,
} from "react-icons/pi";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import ReactPlayer from "react-player";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface TrackItem {
  name: string;
  url: string;
  bpm: number | null;
  markers?: Marker[];
}

interface Marker {
  position: number;
  label: string;
}

export default function DJDeck() {
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  // Player states
  const [playing1, setPlaying1] = useState<boolean>(false);
  const [playing2, setPlaying2] = useState<boolean>(false);
  const [volume1, setVolume1] = useState<number>(0.8);
  const [volume2, setVolume2] = useState<number>(0.8);
  const [playbackRate1, setPlaybackRate1] = useState<number>(1.0);
  const [playbackRate2, setPlaybackRate2] = useState<number>(1.0);
  const [crossfader, setCrossfader] = useState<number>(50);
  const [url1, setUrl1] = useState<string>("");
  const [url2, setUrl2] = useState<string>("");
  const [duration1, setDuration1] = useState<number>(0);
  const [duration2, setDuration2] = useState<number>(0);
  const [played1, setPlayed1] = useState<number>(0);
  const [played2, setPlayed2] = useState<number>(0);

  // Marker states - enhanced with labels
  const [markers1, setMarkers1] = useState<Marker[]>([]);
  const [markers2, setMarkers2] = useState<Marker[]>([]);
  const [markerLabel1, setMarkerLabel1] = useState<string>("");
  const [markerLabel2, setMarkerLabel2] = useState<string>("");
  const [showMarkerList1, setShowMarkerList1] = useState<boolean>(false);
  const [showMarkerList2, setShowMarkerList2] = useState<boolean>(false);

  // URL Library
  const [urlLibrary, setUrlLibrary] = useState<TrackItem[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<TrackItem[]>([
    ...urlLibrary,
  ]);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Add to library states
  const [newTrackName, setNewTrackName] = useState<string>("");
  const [newTrackUrl, setNewTrackUrl] = useState<string>("");
  const [newTrackBpm, setNewTrackBpm] = useState<string>("");

  const player1Ref = useRef<ReactPlayer>(null);
  const player2Ref = useRef<ReactPlayer>(null);

  const actualVolume1 = volume1 * (1 - crossfader / 100);
  const actualVolume2 = volume2 * (crossfader / 100);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Filter library when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = urlLibrary.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLibrary(filtered);
    } else {
      setFilteredLibrary([...urlLibrary]);
    }
  }, [searchTerm, urlLibrary]);

  // Add this useEffect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Deck 1 play/pause when "1" key is pressed
      if (e.key === "1") {
        setPlaying1((prev) => !prev);
      }
      // Toggle Deck 2 play/pause when "2" key is pressed
      else if (e.key === "2") {
        setPlaying2((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        setCrossfader(0);
      } else if (e.key === "ArrowRight") {
        setCrossfader(100);
      } else if (e.key == "ArrowDown") {
        setCrossfader(50);
      }
    };

    // Add the event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Add this useEffect to update the library when markers change
  useEffect(() => {
    if (!url1) return;

    // Update the library entry for the current track
    setUrlLibrary((prevLibrary) =>
      prevLibrary.map((track) => {
        if (track.url === url1) {
          return {
            ...track,
            markers: markers1.length > 0 ? markers1 : undefined,
          };
        }
        return track;
      })
    );
  }, [markers1, url1]);

  useEffect(() => {
    if (!url2) return;

    // Update the library entry for the current track
    setUrlLibrary((prevLibrary) =>
      prevLibrary.map((track) => {
        if (track.url === url2) {
          return {
            ...track,
            markers: markers2.length > 0 ? markers2 : undefined,
          };
        }
        return track;
      })
    );
  }, [markers2, url2]);

  // Handle duration updates
  const handleDuration1 = (duration: number) => setDuration1(duration);
  const handleDuration2 = (duration: number) => setDuration2(duration);

  // Handle progress updates
  const handleProgress1 = (state: { played: number; seeking?: boolean }) => {
    if (!state.seeking) {
      setPlayed1(state.played);
    }
  };

  const handleProgress2 = (state: { played: number; seeking?: boolean }) => {
    if (!state.seeking) {
      setPlayed2(state.played);
    }
  };

  // Format time helper function
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "00:00.000";
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    const ms = date.getUTCMilliseconds().toString().padStart(3, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}.${ms}`;
    }
    return `${mm}:${ss}.${ms}`;
  };

  // Seek functionality
  const handleSeek1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlayed1(value);
    player1Ref.current?.seekTo(value);
  };

  const handleSeek2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlayed2(value);
    player2Ref.current?.seekTo(value);
  };

  // Add marker functionality - enhanced with labels
  const addMarker1 = () => {
    const newMarker: Marker = {
      position: played1,
      label: markerLabel1 || `Marker ${markers1.length + 1}`,
    };
    setMarkers1([...markers1, newMarker]);
    setMarkerLabel1("");
  };

  const addMarker2 = () => {
    const newMarker: Marker = {
      position: played2,
      label: markerLabel2 || `Marker ${markers2.length + 1}`,
    };
    setMarkers2([...markers2, newMarker]);
    setMarkerLabel2("");
  };

  // Remove marker functionality
  const removeMarker1 = (index: number) => {
    setMarkers1(markers1.filter((_, i) => i !== index));
  };

  const removeMarker2 = (index: number) => {
    setMarkers2(markers2.filter((_, i) => i !== index));
  };

  // Jump to marker functionality
  const jumpToMarker1 = (position: number) => {
    setPlayed1(position);
    player1Ref.current?.seekTo(position);
  };

  const jumpToMarker2 = (position: number) => {
    setPlayed2(position);
    player2Ref.current?.seekTo(position);
  };

  // Nudge marker functionality
  const nudgeMarker1 = (index: number, direction: "forward" | "backward") => {
    const updatedMarkers = [...markers1];
    const nudgeAmount = 0.001; // Adjust as needed

    if (direction === "forward") {
      updatedMarkers[index].position = Math.min(
        1,
        updatedMarkers[index].position + nudgeAmount
      );
    } else {
      updatedMarkers[index].position = Math.max(
        0,
        updatedMarkers[index].position - nudgeAmount
      );
    }

    setMarkers1(updatedMarkers);
  };

  const nudgeMarker2 = (index: number, direction: "forward" | "backward") => {
    const updatedMarkers = [...markers2];
    const nudgeAmount = 0.001; // Adjust as needed

    if (direction === "forward") {
      updatedMarkers[index].position = Math.min(
        1,
        updatedMarkers[index].position + nudgeAmount
      );
    } else {
      updatedMarkers[index].position = Math.max(
        0,
        updatedMarkers[index].position - nudgeAmount
      );
    }

    setMarkers2(updatedMarkers);
  };

  // Update marker label
  const updateMarkerLabel1 = (index: number, newLabel: string) => {
    const updatedMarkers = [...markers1];
    updatedMarkers[index].label = newLabel;
    setMarkers1(updatedMarkers);
  };

  const updateMarkerLabel2 = (index: number, newLabel: string) => {
    const updatedMarkers = [...markers2];
    updatedMarkers[index].label = newLabel;
    setMarkers2(updatedMarkers);
  };

  // Handle mouse scroll for sliders
  const handleScroll = (
    e: React.WheelEvent,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    min: number,
    max: number,
    step: number
  ) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -step : step;
    setValue((prev) => Math.min(max, Math.max(min, prev + delta)));
  };

  // Update the applyUrlToPlayer function to properly load markers
  const applyUrlToPlayer = (player: "left" | "right") => {
    if (!selectedUrl) return;

    // Find the track in the library
    const trackWithMarkers = urlLibrary.find(
      (track) => track.url === selectedUrl
    );

    if (player === "left") {
      setUrl1(selectedUrl);
      // Clear existing markers and set new ones if available
      setMarkers1(trackWithMarkers?.markers || []);
    } else if (player === "right") {
      setUrl2(selectedUrl);
      // Clear existing markers and set new ones if available
      setMarkers2(trackWithMarkers?.markers || []);
    }
  };

  // Open modal and reset form
  const openAddTrackModal = () => {
    setNewTrackName("");
    setNewTrackUrl("");
    setNewTrackBpm("");
    setIsModalOpen(true);
  };

  // Add track to library
  const addTrackToLibrary = () => {
    if (newTrackName && newTrackUrl) {
      const newTrack: TrackItem = {
        name: newTrackName,
        url: newTrackUrl,
        bpm: newTrackBpm ? parseFloat(newTrackBpm) : null,
      };
      setUrlLibrary([...urlLibrary, newTrack]);
      setNewTrackName("");
      setNewTrackUrl("");
      setNewTrackBpm("");
      setIsModalOpen(false); // Close modal after adding
    }
  };

  // Remove track from library
  const removeTrackFromLibrary = (index: number) => {
    const newLibrary = [...urlLibrary];
    newLibrary.splice(index, 1);
    setUrlLibrary(newLibrary);
  };

  // Move track up in library
  const moveTrackUp = (index: number) => {
    if (index > 0) {
      const newLibrary = [...urlLibrary];
      const temp = newLibrary[index];
      newLibrary[index] = newLibrary[index - 1];
      newLibrary[index - 1] = temp;
      setUrlLibrary(newLibrary);
    }
  };

  // Move track down in library
  const moveTrackDown = (index: number) => {
    if (index < urlLibrary.length - 1) {
      const newLibrary = [...urlLibrary];
      const temp = newLibrary[index];
      newLibrary[index] = newLibrary[index + 1];
      newLibrary[index + 1] = temp;
      setUrlLibrary(newLibrary);
    }
  };

  const exportLibrary = () => {
    // Create a copy of the library with markers included
    const libraryWithMarkers = urlLibrary.map((track) => {
      // Look for markers associated with this track's URL
      const trackMarkers1 = url1 === track.url ? markers1 : [];
      const trackMarkers2 = url2 === track.url ? markers2 : [];

      // Combine markers from both decks (if same track was loaded in both)
      const combinedMarkers = [...trackMarkers1, ...trackMarkers2];

      // Return track with markers included
      return {
        ...track,
        markers: combinedMarkers.length > 0 ? combinedMarkers : undefined,
      };
    });

    const dataStr = JSON.stringify(libraryWithMarkers);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "library.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (e.target?.result) {
          try {
            const importedLibrary = JSON.parse(
              e.target.result as string
            ) as TrackItem[];

            // Set the entire library with markers preserved
            setUrlLibrary(importedLibrary);

            // If current track URLs match any imported tracks with markers, load those markers
            importedLibrary.forEach((track) => {
              if (track.markers && track.markers.length > 0) {
                if (track.url === url1) {
                  setMarkers1(track.markers);
                }
                if (track.url === url2) {
                  setMarkers2(track.markers);
                }
              }
            });
          } catch (error) {
            console.error("Error parsing imported library:", error);
            alert("Invalid library file format");
          }
        }
      };
    }
  };

  // Sort markers by position
  const sortedMarkers1 = [...markers1].sort((a, b) => a.position - b.position);
  const sortedMarkers2 = [...markers2].sort((a, b) => a.position - b.position);

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* DECK 1 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Deck 1</h2>

            {/* URL Input */}
            <div className="mb-4">
              <input
                type="text"
                value={url1}
                onChange={(e) => setUrl1(e.target.value)}
                placeholder="Enter YouTube/SoundCloud URL..."
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>

            {/* Player */}
            <div className="relative pt-[56.25%] bg-black mb-4">
              {hasMounted && (
                <div className="absolute top-0 left-0 w-full h-full">
                  <ReactPlayer
                    ref={player1Ref}
                    url={url1}
                    playing={playing1}
                    width="100%"
                    height="100%"
                    playbackRate={playbackRate1}
                    volume={actualVolume1}
                    onDuration={handleDuration1}
                    onProgress={(state) =>
                      handleProgress1(
                        state as { played: number; seeking?: boolean }
                      )
                    }
                    onReady={() => {
                      // Player is ready, you can now safely set the volume
                      if (player1Ref.current) {
                        player1Ref.current
                          .getInternalPlayer()
                          .setVolume(actualVolume1);
                      }
                    }}
                    className="rounded"
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col space-y-6">
              {/* Transport Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setPlaying1(!playing1)}
                    className={`p-2 w-16 rounded ${
                      playing1
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {playing1 ? "Pause" : "Play"}
                  </Button>
                  <PiNumberSquareOne size={24} />
                </div>
                <div>
                  {formatTime(played1 * duration1)} / {formatTime(duration1)}
                </div>
              </div>

              {/* Playback Rate */}
              <div className="flex items-center space-x-2">
                <span>BPM:</span>
                <div className="flex w-32 px-2 py-1 bg-gray-700 rounded">
                  {urlLibrary.find((track) => track.url === url1)?.bpm
                    ? (
                        urlLibrary.find((track) => track.url === url1)!.bpm! *
                        playbackRate1
                      ).toFixed(2)
                    : "N/A"}
                </div>
                <span>Speed:</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.01}
                  value={playbackRate1}
                  onChange={(e) => setPlaybackRate1(parseFloat(e.target.value))}
                  onWheel={(e) =>
                    handleScroll(e, setPlaybackRate1, 0.5, 2, 0.01)
                  }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span>{playbackRate1.toFixed(2)}x</span>
              </div>

              {/* Seek Slider */}
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played1}
                  onChange={handleSeek1}
                  onWheel={(e) => handleScroll(e, setPlayed1, 0, 1, 0.01)}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                {/* Markers for Deck 1 */}
                {sortedMarkers1.map((marker, index) => (
                  <div
                    key={index}
                    className="absolute top-0 h-2 w-1 bg-yellow-400"
                    style={{ left: `${marker.position * 100}%` }}
                    onClick={() => jumpToMarker1(marker.position)}
                    title={marker.label}
                  />
                ))}
              </div>

              {/* Add Marker Input and Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={markerLabel1}
                  onChange={(e) => setMarkerLabel1(e.target.value)}
                  placeholder="Marker label"
                  className="p-2 bg-gray-700 rounded border border-gray-600 text-white flex-grow"
                />
                <Button
                  onClick={addMarker1}
                  className="bg-blue-600 hover:bg-blue-700 rounded whitespace-nowrap"
                >
                  Add
                </Button>
              </div>

              {/* Marker List Toggle */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowMarkerList1(!showMarkerList1)}
                  className="px-4 py-2 bg-gray-700 rounded"
                >
                  {showMarkerList1 ? "Hide Markers" : "Show Markers"}
                </button>
                <span className="text-sm text-gray-400">
                  {markers1.length} markers
                </span>
              </div>

              {/* Marker List */}
              {showMarkerList1 && (
                <div className="mt-2 bg-gray-700 rounded p-2 max-h-48 overflow-y-auto">
                  {sortedMarkers1.length === 0 ? (
                    <p className="text-gray-400 text-center">No markers yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {sortedMarkers1.map((marker, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 rounded"
                        >
                          <div className="flex items-center">
                            <button
                              onClick={() => jumpToMarker1(marker.position)}
                              className="mr-2 px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
                              title="Jump to marker"
                            >
                              {formatTime(marker.position * duration1)}
                            </button>
                            <input
                              type="text"
                              value={marker.label}
                              onChange={(e) =>
                                updateMarkerLabel1(index, e.target.value)
                              }
                              className="p-1 mr-1 bg-gray-700 rounded border border-gray-600 text-white w-full"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => nudgeMarker1(index, "backward")}
                              className="p-1 bg-gray-700 rounded hover:bg-gray-800"
                              title="Nudge backward"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              onClick={() => nudgeMarker1(index, "forward")}
                              className="p-1 bg-gray-700 rounded hover:bg-gray-800"
                              title="Nudge forward"
                            >
                              <ChevronRight size={14} />
                            </button>
                            <button
                              onClick={() => removeMarker1(index)}
                              className="p-1 bg-red-700 rounded hover:bg-red-800"
                              title="Remove marker"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN */}
          <div className="flex flex-col space-y-6">
            {/* URL LIBRARY */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Library</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={openAddTrackModal}
                    className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add
                  </button>
                  <button
                    onClick={exportLibrary}
                    className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
                  >
                    Export
                  </button>
                  <label className="px-3 py-2 bg-purple-600 rounded hover:bg-purple-700 text-center cursor-pointer">
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importLibrary}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="flex w-full justify-between">
                <div
                  className="flex min-h-full items-center border border-gray-700 rounded-md hover:bg-gray-700 hover:cursor-pointer"
                  role="button"
                  onClick={() => applyUrlToPlayer("left")}
                >
                  <ChevronLeft className="text-gray-500" />
                </div>

                {/* URL List */}
                <div className="flex flex-col w-full justify-between space-y-2 mx-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <div className="flex flex-col w-full space-y-2 max-h-48 overflow-y-auto">
                    {filteredLibrary.map((item, index) => {
                      const originalIndex = urlLibrary.findIndex(
                        (originalItem) => originalItem.url === item.url
                      );
                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center justify-between p-2 rounded hover:bg-gray-500 hover:cursor-pointer bg-gray-600",
                            selectedUrl === item.url && "bg-gray-400"
                          )}
                        >
                          <div
                            className="flex-grow flex flex-col"
                            onClick={() => setSelectedUrl(item.url)}
                          >
                            <span>{item.name}</span>
                            {item.bpm && (
                              <span className="text-xs text-gray-300">
                                {item.bpm} BPM
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveTrackUp(originalIndex)}
                                className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                onClick={() => moveTrackDown(originalIndex)}
                                className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() =>
                                removeTrackFromLibrary(originalIndex)
                              }
                              className="px-2 py-1 bg-red-700 rounded hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div
                  className="flex min-h-full items-center border border-gray-700 rounded-md hover:bg-gray-700 hover:cursor-pointer"
                  role="button"
                  onClick={() => applyUrlToPlayer("right")}
                >
                  <ChevronRight className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* VOLUME SLIDERS */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Volume</h2>
              <div className="flex w-full justify-evenly">
                {/* Deck 1 Volume */}
                <div className="flex flex-col items-center space-y-2">
                  <span>1</span>
                  <Slider
                    orientation="vertical"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[volume1]}
                    onValueChange={(values) => setVolume1(values[0])}
                    onWheel={(e) => handleScroll(e, setVolume1, 0, 1, 0.05)}
                  />
                  <span className="w-12 text-center">
                    {Math.round(volume1 * 100)}%
                  </span>
                </div>

                {/* Deck 2 Volume */}
                <div className="flex flex-col items-center space-y-2">
                  <span>2</span>
                  <Slider
                    orientation="vertical"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[volume2]}
                    onValueChange={(values) => setVolume2(values[0])}
                    onWheel={(e) => handleScroll(e, setVolume2, 0, 1, 0.05)}
                  />
                  <span className="w-12 text-center">
                    {Math.round(volume2 * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* CROSSFADER */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Crossfader</h2>
              <div className="flex items-center space-x-2">
                <span className="w-4 text-center">1</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={crossfader}
                  onChange={(e) => setCrossfader(parseInt(e.target.value))}
                  onWheel={(e) => handleScroll(e, setCrossfader, 0, 100, 10)}
                  className="w-full h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-4 text-center">2</span>
              </div>
              <div className="flex justify-between items-center -mx-1 mt-1">
                <PiArrowSquareLeft size={24} />
                <PiArrowSquareDown size={24} />
                <PiArrowSquareRight size={24} />
              </div>
            </div>
          </div>

          {/* DECK 2 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Deck 2</h2>

            {/* URL Input */}
            <div className="mb-4">
              <input
                type="text"
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                placeholder="Enter YouTube/SoundCloud URL..."
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>

            {/* Player */}
            <div className="relative pt-[56.25%] bg-black mb-4">
              {hasMounted && (
                <div className="absolute top-0 left-0 w-full h-full">
                  <ReactPlayer
                    ref={player2Ref}
                    url={url2}
                    playing={playing2}
                    width="100%"
                    height="100%"
                    playbackRate={playbackRate2}
                    volume={actualVolume2}
                    onDuration={handleDuration2}
                    onProgress={(state) =>
                      handleProgress2(
                        state as { played: number; seeking?: boolean }
                      )
                    }
                    onReady={() => {
                      if (player2Ref.current) {
                        player2Ref.current
                          .getInternalPlayer()
                          .setVolume(actualVolume2);
                      }
                    }}
                    className="rounded"
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col space-y-6">
              {/* Transport Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setPlaying2(!playing2)}
                    className={`p-2 w-16 rounded ${
                      playing2
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {playing2 ? "Pause" : "Play"}
                  </Button>
                  <PiNumberSquareTwo size={24} />
                </div>
                <div>
                  {formatTime(played2 * duration2)} / {formatTime(duration2)}
                </div>
              </div>

              {/* Playback Rate */}
              <div className="flex items-center space-x-2">
                <span>BPM:</span>
                <div className="flex w-32 px-2 py-1 bg-gray-700 rounded">
                  {urlLibrary.find((track) => track.url === url2)?.bpm
                    ? (
                        urlLibrary.find((track) => track.url === url2)!.bpm! *
                        playbackRate2
                      ).toFixed(2)
                    : "N/A"}
                </div>
                <span>Speed:</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.01}
                  value={playbackRate2}
                  onChange={(e) => setPlaybackRate2(parseFloat(e.target.value))}
                  onWheel={(e) =>
                    handleScroll(e, setPlaybackRate2, 0.5, 2, 0.01)
                  }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span>{playbackRate2.toFixed(2)}x</span>
              </div>

              {/* Seek Slider */}
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played2}
                  onChange={handleSeek2}
                  onWheel={(e) => handleScroll(e, setPlayed2, 0, 1, 0.01)}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                {/* Markers for Deck 2 */}
                {sortedMarkers2.map((marker, index) => (
                  <div
                    key={index}
                    className="absolute top-0 h-2 w-1 bg-yellow-400"
                    style={{ left: `${marker.position * 100}%` }}
                    onClick={() => jumpToMarker2(marker.position)}
                    title={marker.label}
                  />
                ))}
              </div>

              {/* Add Marker Input and Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={markerLabel2}
                  onChange={(e) => setMarkerLabel2(e.target.value)}
                  placeholder="Marker label"
                  className="p-2 bg-gray-700 rounded border border-gray-600 text-white flex-grow"
                />
                <Button
                  onClick={addMarker2}
                  className="bg-blue-600 hover:bg-blue-700 rounded whitespace-nowrap"
                >
                  Add
                </Button>
              </div>

              {/* Marker List Toggle */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowMarkerList2(!showMarkerList2)}
                  className="px-4 py-2 bg-gray-700 rounded"
                >
                  {showMarkerList2 ? "Hide Markers" : "Show Markers"}
                </button>
                <span className="text-sm text-gray-400">
                  {markers2.length} markers
                </span>
              </div>

              {/* Marker List */}
              {showMarkerList2 && (
                <div className="mt-2 bg-gray-700 rounded p-2 max-h-48 overflow-y-auto">
                  {sortedMarkers2.length === 0 ? (
                    <p className="text-gray-400 text-center">No markers yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {sortedMarkers2.map((marker, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 rounded"
                        >
                          <div className="flex items-center">
                            <button
                              onClick={() => jumpToMarker2(marker.position)}
                              className="mr-2 px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
                              title="Jump to marker"
                            >
                              {formatTime(marker.position * duration2)}
                            </button>
                            <input
                              type="text"
                              value={marker.label}
                              onChange={(e) =>
                                updateMarkerLabel2(index, e.target.value)
                              }
                              className="p-1 mr-1 bg-gray-700 rounded border border-gray-600 text-white w-full"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => nudgeMarker2(index, "backward")}
                              className="p-1 bg-gray-700 rounded hover:bg-gray-800"
                              title="Nudge backward"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              onClick={() => nudgeMarker2(index, "forward")}
                              className="p-1 bg-gray-700 rounded hover:bg-gray-800"
                              title="Nudge forward"
                            >
                              <ChevronRight size={14} />
                            </button>
                            <button
                              onClick={() => removeMarker2(index)}
                              className="p-1 bg-red-700 rounded hover:bg-red-800"
                              title="Remove marker"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Track Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Add Track</h2>
            <input
              type="text"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              placeholder="Track name"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white mb-4"
            />
            <input
              type="text"
              value={newTrackUrl}
              onChange={(e) => setNewTrackUrl(e.target.value)}
              placeholder="Track URL"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white mb-4"
            />
            <input
              type="number"
              value={newTrackBpm}
              onChange={(e) => setNewTrackBpm(e.target.value)}
              placeholder="BPM (optional)"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={addTrackToLibrary}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                Add
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-red-600 rounded ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
