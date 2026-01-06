import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  type: 'start_time' | 'end_time' | 'overdue';
  title: string;
  message: string;
  taskId: string;
  taskTitle: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ['start_time', 'end_time', 'overdue'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    taskId: {
      type: String,
      required: true,
    },
    taskTitle: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent duplicate notifications
NotificationSchema.index({ taskId: 1, type: 1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
