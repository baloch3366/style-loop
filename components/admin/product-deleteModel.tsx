'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DeleteProductDocument } from '@/lib/graphql/generated/graphql';
import type { ProductCardFieldsFragment } from '@/lib/graphql/generated/graphql';

interface ProductDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductCardFieldsFragment;
  onSuccess: () => void;
}

export default function ProductDeleteModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductDeleteModalProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProduct] = useMutation(DeleteProductDocument);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct({ variables: { id: product.id } });
      toast({ title: 'Success', description: 'Product deleted successfully' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{product.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}