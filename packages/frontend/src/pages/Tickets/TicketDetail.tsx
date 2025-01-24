import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  Grid,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  CardMedia,
  styled,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import {
  useTicket,
  useUpdateTicket,
  useTicketComments,
  useCreateComment,
  useUploadFile,
  useDeleteFile,
  ticketKeys,
} from '../../hooks/useTickets';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '@crm/shared/constants';
import type { Ticket, TicketAttachment, TicketUpdate } from '@crm/shared/types/ticket';
import { supabase } from '@crm/shared/utils/api-client';
import { useQueryClient } from '@tanstack/react-query';

const statusColors = {
  open: 'info',
  in_progress: 'warning',
  pending: 'secondary',
  resolved: 'success',
  closed: 'default',
} as const;

const priorityColors = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
} as const;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon />;
  if (fileType === 'application/pdf') return <PdfIcon />;
  if (fileType.includes('word') || fileType.includes('doc')) return <DocIcon />;
  return <FileIcon />;
};

const ImagePreviewDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  '& .MuiDialogContent-root': {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<TicketAttachment | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<TicketAttachment | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ticket, isLoading: isLoadingTicket } = useTicket(id!);
  const { data: commentsData } = useTicketComments(id!);
  const updateTicket = useUpdateTicket();
  const createComment = useCreateComment();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!id) return;

    // Subscribe to ticket comments
    const commentsSubscription = supabase
      .channel(`ticket-comments-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ticketKeys.comments(id) });
        }
      )
      .subscribe();

    // Subscribe to ticket attachments
    const attachmentsSubscription = supabase
      .channel(`ticket-attachments-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_attachments',
          filter: `ticket_id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) });
        }
      )
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
      attachmentsSubscription.unsubscribe();
    };
  }, [id, queryClient]);

  // Handle keyboard shortcuts for image preview
  useEffect(() => {
    if (!previewImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setPreviewImage(null);
          setImageZoom(1);
          break;
        case '+':
        case '=':
          handleZoom(0.25);
          break;
        case '-':
          handleZoom(-0.25);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    if (!ticket) return;
    const update: TicketUpdate = {
      status: event.target.value as any,
    };
    await updateTicket.mutateAsync({ id: ticket.id, ticket: update });
  };

  const handlePriorityChange = async (event: SelectChangeEvent<string>) => {
    if (!ticket) return;
    const update: TicketUpdate = {
      priority: event.target.value as any,
    };
    await updateTicket.mutateAsync({ id: ticket.id, ticket: update });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !ticket || !user?.id) return;

    await createComment.mutateAsync({
      ticketId: ticket.id,
      content: comment,
      attachments: [],
      userId: user.id,
    });
    setComment('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ticket) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only images, PDFs, and Word documents are allowed.');
      return;
    }

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      await uploadFile.mutateAsync({
        file,
        ticketId: ticket.id,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!ticket) return;
    try {
      await deleteFile.mutateAsync({ id: fileId, ticketId: ticket.id });
      setFileToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const handleFileClick = (attachment: TicketAttachment) => {
    if (attachment.fileType.startsWith('image/')) {
      setPreviewImage(attachment);
      setImageZoom(1);
    } else {
      window.open(attachment.fileUrl, '_blank');
    }
  };

  const handleZoom = (factor: number) => {
    setImageZoom(prev => Math.max(0.5, Math.min(3, prev + factor)));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !ticket) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only images, PDFs, and Word documents are allowed.');
      return;
    }

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      await uploadFile.mutateAsync({
        file,
        ticketId: ticket.id,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  if (isLoadingTicket) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Ticket not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTES.TICKETS)}
        >
          Back to Tickets
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {ticket.title}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={ticket.status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={ticket.priority}
                label="Priority"
                onChange={handlePriorityChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography>{ticket.description}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Attachments
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
                position: 'relative',
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isDragging && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -16,
                    left: -16,
                    right: -16,
                    bottom: -16,
                    background: (theme) => theme.palette.primary.main + '22',
                    border: (theme) => `2px dashed ${theme.palette.primary.main}`,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Typography variant="h6" color="primary">
                    Drop file here to upload
                  </Typography>
                </Box>
              )}
              <Box sx={{ position: 'relative' }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={uploadFile.isPending ? <CircularProgress size={20} /> : <AttachFileIcon />}
                  disabled={uploadFile.isPending}
                >
                  {uploadFile.isPending ? 'Uploading...' : 'Add File'}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                    disabled={uploadFile.isPending}
                  />
                </Button>
                {uploadProgress > 0 && (
                  <Box sx={{ position: 'absolute', bottom: -8, left: 0, right: 0 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}
              </Box>
              {ticket.attachments?.map((attachment: TicketAttachment) => (
                <Tooltip 
                  key={attachment.id}
                  title={`${attachment.fileName} (${formatFileSize(attachment.fileSize)})`}
                >
                  <Chip
                    icon={getFileIcon(attachment.fileType)}
                    label={`${attachment.fileName} • ${formatFileSize(attachment.fileSize)}`}
                    onDelete={deleteFile.isPending ? undefined : () => setFileToDelete(attachment)}
                    onClick={() => handleFileClick(attachment)}
                    sx={{ 
                      maxWidth: 300,
                      '& .MuiChip-label': {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                      '& .MuiChip-icon': {
                        fontSize: 20,
                      }
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>

        <Box
          component="form"
          onSubmit={handleCommentSubmit}
          sx={{ mb: 3 }}
        >
          <TextField
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!comment.trim()}
            >
              Add Comment
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          {commentsData?.comments.map((comment) => (
            <Box key={comment.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                {/* TODO: Show user name */}
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
              <Typography>{comment.content}</Typography>
              {comment.attachments.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {comment.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      label={attachment}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  ))}
                </Box>
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Box>
      </Paper>

      <Dialog
        open={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{fileToDelete?.fileName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileToDelete(null)}>Cancel</Button>
          <Button
            onClick={() => fileToDelete && handleFileDelete(fileToDelete.id)}
            color="error"
            disabled={deleteFile.isPending}
          >
            {deleteFile.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        open={!!previewImage}
        onClose={() => {
          setPreviewImage(null);
          setImageZoom(1);
        }}
        maxWidth={false}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
        }}>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            {previewImage?.fileName}
          </Typography>
          <Box>
            <Tooltip title="Zoom Out (-)">
              <IconButton
                onClick={() => handleZoom(-0.25)}
                disabled={imageZoom <= 0.5}
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In (+)">
              <IconButton
                onClick={() => handleZoom(0.25)}
                disabled={imageZoom >= 3}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close (Esc)">
              <IconButton
                onClick={() => {
                  setPreviewImage(null);
                  setImageZoom(1);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              overflow: 'auto',
              maxWidth: '100%',
              maxHeight: 'calc(90vh - 64px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CardMedia
              component="img"
              image={previewImage?.fileUrl}
              alt={previewImage?.fileName}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `scale(${imageZoom})`,
                transition: 'transform 0.2s ease-in-out',
              }}
            />
          </Box>
        </DialogContent>
      </ImagePreviewDialog>
    </Box>
  );
}; 