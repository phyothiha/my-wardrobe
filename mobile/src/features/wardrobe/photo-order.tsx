import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import type { Photo } from './model';
import { accent, CloseButton } from './ui';

const gap = 8;
const columns = 3;
const removeRowHeight = 32;
type Drag = { from: number; startX: number; startY: number };

export function PhotoOrder({ photos, change, onDrag }: {
  photos: Photo[]; change: (photos: Photo[]) => void; onDrag: (active: boolean) => void;
}) {
  const [width, setWidth] = useState(0);
  const [target, setTarget] = useState<number>();
  const drag = useRef<Drag | null>(null);
  const side = Math.floor((width - gap * (columns - 1)) / columns);

  function destination(event: GestureResponderEvent, active: Drag) {
    const { pageX, pageY } = event.nativeEvent;
    const column = active.from % columns + Math.round((pageX - active.startX) / (side + gap));
    const row = Math.floor(active.from / columns) + Math.round((pageY - active.startY) / (side + removeRowHeight + gap));
    const index = row * columns + Math.max(0, Math.min(columns - 1, column));
    return Math.max(0, Math.min(photos.length - 1, index));
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return;
    const ordered = photos.slice();
    ordered.splice(to, 0, ...ordered.splice(from, 1));
    change(ordered);
  }

  function finish() {
    drag.current = null;
    setTarget(undefined);
    onDrag(false);
  }

  return <View style={{ gap }} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {side > 0 && photos.map((photo, index) => <View key={photo.uri + index} style={{ width: side }}>
        <View accessible accessibilityRole="adjustable" accessibilityLabel={'Photo ' + (index + 1)}
          accessibilityActions={[{ name: 'decrement', label: 'Move earlier' }, { name: 'increment', label: 'Move later' }]}
          onAccessibilityAction={({ nativeEvent }) => move(index, index + (nativeEvent.actionName === 'increment' ? 1 : -1))}
          onStartShouldSetResponder={() => photos.length > 1}
          onResponderGrant={({ nativeEvent }) => {
            drag.current = { from: index, startX: nativeEvent.pageX, startY: nativeEvent.pageY };
            setTarget(index);
            onDrag(true);
          }}
          onResponderMove={event => { if (drag.current) setTarget(destination(event, drag.current)); }}
          onResponderRelease={event => {
            if (drag.current) move(index, destination(event, drag.current));
            finish();
          }}
          onResponderTerminationRequest={() => false} onResponderTerminate={finish}
          style={[styles.thumbnail, { height: side }, target === index && { borderColor: accent }]}>
          <Image source={photo.uri} pointerEvents="none" style={StyleSheet.absoluteFill} />
        </View>
        <View style={styles.remove}>
          <CloseButton compact label={'Remove photo ' + (index + 1)} onPress={() => change(photos.filter((_, i) => i !== index))} />
        </View>
      </View>)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  thumbnail: { overflow: 'hidden', borderRadius: 8, borderWidth: 3, borderColor: 'transparent' },
  remove: { height: removeRowHeight, alignItems: 'center' },
});
