import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd'
import { DragIndicator } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import MiscellaneousApi from '../../../api/managers/miscellaneous'
import { Interceptor } from '../../../helpers/classes'
import DeleteIcon from '@mui/icons-material/Delete'
import LaunchIcon from '@mui/icons-material/Launch'
import SnackbarComponent from '../../../components/SnackBar'

interface FormData {
  faqArr: Array<{
    question: string
    _id: string
    answer: { text: string; videoLink: string }
  }>
}

interface Payload {
  faqArr: Array<{
    _id: string
    question: string
    answer?: { text: string; videoLink: string }
  }>
}

function SiteFaqs() {
  const [faqs, setFaqs] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { control, handleSubmit, register, reset } = useForm<FormData>({
    defaultValues: {
      faqArr: [],
    },
  })
  const getAllFaqs = async () => {
    Interceptor.handleApi(
      async () => await MiscellaneousApi.getSiteFaqs(),
      undefined,
      (res) => {
        if (res?.success) {
          setFaqs(res?.data?.faqs)
        }
      }
    )
  }
  useEffect(() => {
    getAllFaqs()
  }, [])

  useEffect(() => {
    if (faqs.length > 0) {
      const data = [...faqs]

      reset({
        faqArr: data,
      })
    }
  }, [faqs])

  const onSubmit = (data: Payload) => {
    const payload = { faqs: data?.faqArr }
    Interceptor.handleApi(
      async () => await MiscellaneousApi.updateSiteFaqs(payload),
      undefined,
      (res) => {
        if (res?.success) {
          setSuccess('Faq updated successfully')
        }
      }
    )
  }

  return (
    <main>
      {error ? (
        <SnackbarComponent
          severity="error"
          message={error}
          open={!!error}
          closeSnackbar={() => {
            setError('')
          }}
        />
      ) : null}
      {success && (
        <SnackbarComponent
          severity="success"
          message={success}
          open={!!success}
          closeSnackbar={() => {
            setSuccess('')
          }}
        />
      )}
      <FaqColumnDnd control={control} register={register} fieldName="faqArr" />
      <Box sx={{ marginTop: '3rem' }}>
        <Button
          sx={{ width: '100%' }}
          onClick={(e) => handleSubmit(onSubmit)()}
          color="primary"
          variant="contained"
        >
          Save
        </Button>
      </Box>
    </main>
  )
}

const styles = () => {
  return {
    getItemStyle: (isDragging: boolean, draggableStyle: any) => ({
      gap: '20px',
      background: 'white',
      rotate: isDragging ? '1deg' : '0deg',
      transformOrigin: `left top`,
      padding: `10px 8px`,
      borderRadius: '5px',
      margin: '10px',
      ...draggableStyle,
    }),
    getListStyle: (isDraggingOver: boolean) => ({
      background: isDraggingOver ? 'lightblue' : '#F0EEED',
      width: '100%',
      borderRadius: '5px',
      paddingTop: '10px',
    }),
  }
}

const { getItemStyle, getListStyle } = styles()

const FaqColumnDnd = ({ control, register, fieldName }: any) => {
  const { fields, append, remove, replace } = useFieldArray({
    name: 'faqArr',
    control,
  })

  const reorder = (
    list: typeof fields,
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }
    const items = reorder(fields, result.source.index, result.destination.index)
    replace(items)
  }

  const openInNewTab = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noreferrer')
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={fieldName}>
        {(provided, snapshot) => {
          return (
            <>
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  ...getListStyle(snapshot.isDraggingOver),
                  display: fields.length > 0 ? 'inherit' : 'none',
                }}
              >
                {fields.map((currentFieldInArray: any, index) => {
                  return (
                    <Draggable
                      key={currentFieldInArray.id}
                      draggableId={currentFieldInArray.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <>
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            <section
                              style={{
                                display: 'flex',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  pl: 1,
                                  pr: 2,
                                }}
                              >
                                <DragIndicator />
                              </Box>
                              <main
                                style={{
                                  margin: '1rem 0rem',
                                  width: '100%',
                                }}
                              >
                                <Controller
                                  key={currentFieldInArray.id}
                                  name={`${fieldName}.${index}.question`}
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      {...register(
                                        `${fieldName}.${index}.question`
                                      )}
                                      fullWidth
                                      size="small"
                                      label="question"
                                      sx={{ flex: 1, mt: 0, mb: 1, p: 0 }}
                                    />
                                  )}
                                />
                                <br />
                                <Controller
                                  key={currentFieldInArray.id}
                                  name={`${fieldName}.${index}.answer.text`}
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      {...register(
                                        `${fieldName}.${index}.answer.text`
                                      )}
                                      fullWidth
                                      label="answer"
                                      size="small"
                                      sx={{ flex: 1, mt: 0, mb: 1, p: 0 }}
                                    />
                                  )}
                                />
                                <Controller
                                  key={currentFieldInArray.id}
                                  name={`${fieldName}.${index}.answer.videoLink`}
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      {...register(
                                        `${fieldName}.${index}.answer.videoLink`
                                      )}
                                      fullWidth
                                      size="small"
                                      label="video link"
                                      sx={{ flex: 1, mt: 2, m: 0, p: 0 }}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <IconButton
                                              onClick={() => {
                                                openInNewTab(
                                                  currentFieldInArray?.answer
                                                    ?.videoLink
                                                )
                                              }}
                                              disabled={
                                                currentFieldInArray?.answer
                                                  ?.videoLink === ''
                                              }
                                              edge="end"
                                            >
                                              <LaunchIcon />
                                            </IconButton>
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  )}
                                />
                              </main>
                            </section>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <DeleteIcon
                                onClick={() => {
                                  remove(index)
                                }}
                                style={{ cursor: 'pointer' }}
                                color="error"
                              />
                            </Box>
                          </div>
                        </>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}

                <Button
                  onClick={() => append({ value: '' })}
                  sx={{ width: '100%', mt: 0.5 }}
                  size="small"
                  variant="text"
                >
                  Add More
                </Button>
              </div>
            </>
          )
        }}
      </Droppable>
    </DragDropContext>
  )
}

export default SiteFaqs
