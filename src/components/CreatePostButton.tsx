'use client'

import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import CreatePostModal from './CreatePostModal'

interface CreatePostButtonProps {
  onPostCreated: () => void
}

export default function CreatePostButton({ onPostCreated }: CreatePostButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handlePostCreated = () => {
    onPostCreated()
  }

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleOpenModal}
        className="bg-blue-500 hover:bg-blue-600 border-blue-500"
      >
        发布动态
      </Button>

      <CreatePostModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onSuccess={handlePostCreated}
      />
    </>
  )
}
