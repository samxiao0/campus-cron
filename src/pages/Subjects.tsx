import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const subjectColors = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899',
  '#8B5A2B', '#6366F1', '#84CC16', '#F97316', '#14B8A6', '#A855F7'
];

export default function Subjects() {
  const subjects = useAppStore((state) => state.subjects);
  const addSubject = useAppStore((state) => state.addSubject);
  const removeSubject = useAppStore((state) => state.removeSubject);
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(subjectColors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    addSubject({ name: name.trim(), color: selectedColor });
    setName('');
    setSelectedColor(subjectColors[0]);
    setIsOpen(false);
    toast.success('Subject added successfully!');
  };

  const handleDelete = (id: string, name: string) => {
    removeSubject(id);
    toast.success(`${name} deleted successfully!`);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
          <p className="text-muted-foreground mt-1">Manage your subjects</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter subject name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {subjectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-primary scale-110' : 'border-muted'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:bg-primary-hover">
                  Add Subject
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card className="bg-gradient-card shadow-card border-0 p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Subjects Yet</h3>
          <p className="text-muted-foreground mb-6">Add your first subject to get started</p>
          <Button 
            onClick={() => setIsOpen(true)}
            className="bg-gradient-primary hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Subject
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subjects.map((subject) => (
            <Card key={subject.id} className="bg-gradient-card shadow-card border-0 p-6 hover:shadow-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Added {subject.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(subject.id, subject.name)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}