'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Staff } from '@/lib/types';
import { FieldGroup } from '@/components/ui/field';
import { formatPrice } from '@/lib/utils';

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'front-desk' as Staff['role'],
    phone: '',
    salary: 0,
    status: 'active' as Staff['status'],
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'staff'));
        const staffData: Staff[] = [];
        snapshot.forEach((doc) => {
          staffData.push({ id: doc.id, ...doc.data() } as Staff);
        });
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const staffData = {
        ...newStaff,
        salary: parseFloat(newStaff.salary.toString()),
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'staff'), staffData);
      setStaff([
        ...staff,
        {
          id: docRef.id,
          ...staffData,
        } as Staff,
      ]);

      setNewStaff({
        name: '',
        email: '',
        role: 'front-desk',
        phone: '',
        salary: 0,
        status: 'active',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await deleteDoc(doc(db, 'staff', staffId));
      setStaff(staff.filter((s) => s.id !== staffId));
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: Staff['status']) => {
    try {
      const newStatus: Staff['status'] = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'staff', staffId), {
        status: newStatus,
      });

      setStaff(
        staff.map((s) =>
          s.id === staffId ? { ...s, status: newStatus } : s
        )
      );
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage hotel staff members</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {showForm ? 'Cancel' : 'Add Staff'}
        </Button>
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Staff Member</CardTitle>
            <CardDescription>Enter the details for the new staff member</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, role: e.target.value as Staff['role'] })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="front-desk">Front Desk</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="manager">Manager</option>
                  </select>
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-foreground">Monthly Salary</label>
                  <Input
                    type="number"
                    value={newStaff.salary}
                    onChange={(e) => setNewStaff({ ...newStaff, salary: parseFloat(e.target.value) })}
                    placeholder="3000"
                    required
                  />
                </FieldGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Add Staff Member
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
      ) : staff.length > 0 ? (
        <div className="space-y-4">
          {staff.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Personal Info */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                  </div>

                  {/* Role */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                  </div>

                  {/* Salary */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Salary</p>
                    <p className="font-semibold text-foreground">
                      {formatPrice(member.salary)}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge
                      className={
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {member.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(member.id, member.status)}
                    >
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteStaff(member.id)}
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
            <p className="text-muted-foreground">No staff members yet. Add your first staff member to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
