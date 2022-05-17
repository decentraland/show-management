```mermaid
sequenceDiagram
    
    VideoSystem->>onVideoEvent: subscribe
    ShowManager->> SubtitleSystem : subscribe.onCueBeginListeners
    loop onVideo event
        onVideoEvent->>VideoSystem: notify video event
    end
    loop onUpdate(dt)
        VideoSystem->>SubtitleSystem: time progressed
        loop check for cues to fire
            SubtitleSystem->>SubtitleSystem: check for cues to fire
            SubtitleSystem->>SubtitleSystem : onCueBeginListeners: notify cue began
            SubtitleSystem-->>ShowManger : runAction
        end
    end
    
```