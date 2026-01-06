import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Todo from '@/models/Todo';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const [todos, total] = await Promise.all([
      Todo.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Todo.countDocuments({})
    ]);
    
    return NextResponse.json({
      todos,
      pagination: {
        total,
        skip,
        limit,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (body.ongoing === undefined) {
      body.ongoing = false;
    }
    
    console.log('Creating todo with body:', body);
    const todo = await Todo.create(body);
    const plainTodo = todo.toObject ? todo.toObject() : todo;
    console.log('Saved todo:', plainTodo);
    return NextResponse.json(plainTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await Todo.deleteMany({});
    return NextResponse.json({ message: 'All todos deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todos' }, { status: 500 });
  }
}
