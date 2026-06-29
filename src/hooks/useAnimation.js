import { useState, useCallback, useRef, useEffect } from 'react'
import { ANIMATION_SPEEDS } from '../utils/constants'

/**
 * 动画控制 Hook
 * 管理算法演示的动画播放
 */
export function useAnimation(steps, onStepChange) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(ANIMATION_SPEEDS.NORMAL.value)
  const timerRef = useRef(null)

  // 清除定时器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 播放动画
  const play = useCallback(() => {
    if (!steps || currentStep >= steps.length) return
    setIsPlaying(true)
    clearTimer()

    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearTimer()
          setIsPlaying(false)
          return prev
        }
        const next = prev + 1
        onStepChange?.(next)
        return next
      })
    }, speed)
  }, [steps, currentStep, speed, clearTimer, onStepChange])

  // 暂停动画
  const pause = useCallback(() => {
    setIsPlaying(false)
    clearTimer()
  }, [clearTimer])

  // 重置动画
  const reset = useCallback(() => {
    pause()
    setCurrentStep(0)
    onStepChange?.(0)
  }, [pause, onStepChange])

  // 前进一步
  const stepForward = useCallback(() => {
    if (!steps || currentStep >= steps.length - 1) return
    pause()
    const next = currentStep + 1
    setCurrentStep(next)
    onStepChange?.(next)
  }, [steps, currentStep, pause, onStepChange])

  // 后退一步
  const stepBackward = useCallback(() => {
    if (currentStep <= 0) return
    pause()
    const prev = currentStep - 1
    setCurrentStep(prev)
    onStepChange?.(prev)
  }, [currentStep, pause, onStepChange])

  // 设置速度
  const changeSpeed = useCallback((newSpeed) => {
    setSpeed(newSpeed)
    if (isPlaying) {
      clearTimer()
      // 用新速度重新开始
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            clearTimer()
            setIsPlaying(false)
            return prev
          }
          const next = prev + 1
          onStepChange?.(next)
          return next
        })
      }, newSpeed)
    }
  }, [isPlaying, steps, clearTimer, onStepChange])

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return {
    isPlaying,
    currentStep,
    speed,
    totalSteps: steps?.length ?? 0,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    changeSpeed,
    isFinished: steps ? currentStep >= steps.length - 1 : false,
    isFirstStep: currentStep <= 0,
    isLastStep: steps ? currentStep >= steps.length - 1 : true,
  }
}
