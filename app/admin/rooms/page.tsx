'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Room } from '@/lib/types';
import { FieldGroup } from '@/components/ui/field';
import { formatPrice } from '@/lib/utils';

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'double' as Room['type'],
    description: '',
    price: 0,
    capacity: 1,
    amenities: '',
    images: [],
    available: true,
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'rooms'));
        const roomsData: Room[] = [];
        snapshot.forEach((doc) => {
          roomsData.push({ id: doc.id, ...doc.data() } as Room);
        });
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const amenities = newRoom.amenities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a !== '');
      
      const roomData = {
        ...newRoom,
        amenities,
        price: parseFloat(newRoom.price.toString()),
        capacity: parseInt(newRoom.capacity.toString()),
        createdAt: editingRoomId 
          ? (rooms.find(r => r.id === editingRoomId)?.createdAt || new Date().toISOString())
          : new Date().toISOString(),
      };

      if (editingRoomId) {
        await updateDoc(doc(db, 'rooms', editingRoomId), roomData);
        setRooms(rooms.map(r => r.id === editingRoomId ? { ...roomData, id: editingRoomId } as Room : r));
      } else {
        const docRef = await addDoc(collection(db, 'rooms'), roomData);
        setRooms([
          ...rooms,
          {
            id: docRef.id,
            ...roomData,
            images: [],
          } as Room,
        ]);
      }

      setNewRoom({
        name: '',
        type: 'double',
        description: '',
        price: 0,
        capacity: 1,
        amenities: '',
        images: [],
        available: true,
      });
      setShowForm(false);
      setEditingRoomId(null);
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleEditRoom = (room: Room) => {
    setNewRoom({
      name: room.name,
      type: room.type,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      amenities: room.amenities.join(', '),
      images: room.images || [],
      available: room.available,
    });
    setEditingRoomId(room.id);
    setShowForm(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await deleteDoc(doc(db, 'rooms', roomId));
      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const handleToggleAvailability = async (roomId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        available: !currentStatus,
      });

      setRooms(
        rooms.map((r) =>
          r.id === roomId ? { ...r, available: !currentStatus } : r
        )
      );
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rooms Management</h1>
          <p className="text-muted-foreground mt-1">Manage hotel rooms and availability</p>
        </div>
        <Button
          onClick={() => {
            if (showForm) {
              setEditingRoomId(null);
              setNewRoom({
                name: '',
                type: 'double',
                description: '',
                price: 0,
                capacity: 1,
                amenities: '',
                images: [],
                available: true,
              });
            }
            setShowForm(!showForm);
          }}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {showForm ? 'Cancel' : 'Add Room'}
        </Button>
      </div>

      {/* Add/Edit Room Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingRoomId ? 'Edit Room' : 'Add New Room'}</CardTitle>
            <CardDescription>
              {editingRoomId ? 'Update the details for this room' : 'Enter the details for the new room'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Room Name</label>
                  <Input
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="Deluxe Suite"
                    required
                  />
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Room Type</label>
                  <select
                    value={newRoom.type}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, type: e.target.value as Room['type'] })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Price per Night</label>
                  <Input
                    type="number"
                    value={newRoom.price || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                    placeholder="150"
                    required
                  />
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Capacity</label>
                  <Input
                    type="number"
                    value={newRoom.capacity || ''}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    placeholder="2"
                    required
                  />
                </FieldGroup>
              </div>

              <FieldGroup>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="Room description..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FieldGroup>

              <FieldGroup>
                <label className="text-sm font-medium text-foreground">Amenities (comma-separated)</label>
                <Input
                  value={newRoom.amenities}
                  onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                  placeholder="WiFi, Air Conditioning, Bathroom"
                  required
                />
              </FieldGroup>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {editingRoomId ? 'Update Room' : 'Add Room'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rooms List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading rooms...</div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{room.name}</h3>
                      <Badge
                        variant={room.available ? 'default' : 'secondary'}
                        className={
                          room.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {room.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{room.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-semibold text-foreground capitalize">{room.type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <p className="font-semibold text-foreground">{formatPrice(room.price)}/night</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Capacity:</span>
                        <p className="font-semibold text-foreground">{room.capacity} guests</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amenities:</span>
                        <p className="font-semibold text-foreground">
                          {Array.isArray(room.amenities) ? room.amenities.length : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEditRoom(room)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleToggleAvailability(room.id, room.available)}
                    >
                      {room.available ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No rooms yet. Add your first room to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
