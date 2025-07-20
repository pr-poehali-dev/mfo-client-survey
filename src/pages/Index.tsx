import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    workAddress: '',
    relativesContact: '',
    amount: [50000],
    period: [30],
    documents: null as File | null,
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('reviewing'); // 'approved', 'rejected', 'reviewing'
  const [timer, setTimer] = useState(50);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCallbackDialog, setShowCallbackDialog] = useState(false);
  const [hasDebt, setHasDebt] = useState(false);

  // Таймер рассмотрения заявки
  useEffect(() => {
    if (currentStep === 6 && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev === 1) {
            // Случайно определяем одобрение или отказ
            setApplicationStatus(Math.random() > 0.3 ? 'approved' : 'rejected');
            setHasDebt(Math.random() > 0.7);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, timer]);

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerifyPhone = () => {
    setShowCodeDialog(true);
    // Генерация кода (имитация)
    const code = Math.floor(1000 + Math.random() * 9000);
    console.log('Код подтверждения:', code);
  };

  const handleCodeSubmit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowCodeDialog(false);
      handleNextStep();
    }, 2000);
  };

  const calculateMonthlyPayment = () => {
    const amount = formData.amount[0];
    const period = formData.period[0];
    const rate = 0.03; // 3% в день
    return Math.round(amount * (1 + rate * period) / period);
  };

  const steps = [
    'Персональные данные',
    'Адреса',
    'Контакты родных',
    'Документы',
    'Калькулятор займа',
    'Рассмотрение заявки',
    'Результат'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mfo-blue-50 via-white to-mfo-blue-100 font-[Roboto]">
      {/* Заголовок с 3D эффектом */}
      <div className="bg-gradient-to-r from-mfo-blue-600 to-mfo-blue-800 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2 animate-fade-in">
            💰 БЫСТРЫЕ ЗАЙМЫ
          </h1>
          <p className="text-center text-mfo-blue-100 text-lg animate-fade-in">
            Получите деньги за 15 минут • До 100,000 ₽ • Без справок
          </p>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="container mx-auto px-4 py-6">
        <Card className="animate-scale-in shadow-xl bg-white/90 backdrop-blur-sm border-0">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-mfo-blue-700">
                  Шаг {currentStep} из {steps.length}
                </span>
                <span className="text-sm text-gray-600">
                  {steps[currentStep - 1]}
                </span>
              </div>
              <Progress value={(currentStep / steps.length) * 100} className="h-3" />
            </div>

            {/* Этапы анкеты */}
            <div className="animate-fade-in">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-mfo-blue-800 mb-6">
                    📱 Персональные данные
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="phone">Номер телефона *</Label>
                      <Input
                        id="phone"
                        placeholder="+7 (999) 123-45-67"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={handleVerifyPhone}
                      className="w-full bg-mfo-blue-600 hover:bg-mfo-blue-700 animate-pulse-glow"
                      disabled={!formData.phone}
                    >
                      <Icon name="Phone" className="mr-2" />
                      Подтвердить номер телефона
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-mfo-blue-800 mb-6">
                    🏠 Адреса
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="address">Адрес регистрации *</Label>
                      <Textarea
                        id="address"
                        placeholder="Введите полный адрес регистрации"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workAddress">Адрес работы</Label>
                      <Textarea
                        id="workAddress"
                        placeholder="Введите адрес места работы"
                        value={formData.workAddress}
                        onChange={(e) => setFormData({...formData, workAddress: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-mfo-blue-800 mb-6">
                    👨‍👩‍👧‍👦 Контакты родных
                  </h2>
                  <div>
                    <Label htmlFor="relatives">Контактные данные близких родственников *</Label>
                    <Textarea
                      id="relatives"
                      placeholder="ФИО, степень родства, номер телефона"
                      value={formData.relativesContact}
                      onChange={(e) => setFormData({...formData, relativesContact: e.target.value})}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-mfo-blue-800 mb-6">
                    📄 Загрузка документов
                  </h2>
                  <div className="border-2 border-dashed border-mfo-blue-300 rounded-lg p-8 text-center hover:border-mfo-blue-500 transition-colors">
                    <Icon name="Upload" size={48} className="mx-auto text-mfo-blue-400 mb-4" />
                    <p className="text-lg font-medium text-mfo-blue-700 mb-2">
                      Загрузите фото паспорта
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Поддерживаемые форматы: JPG, PNG (до 5 МБ)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, documents: e.target.files?.[0] || null})}
                      className="hidden"
                      id="documents"
                    />
                    <Label htmlFor="documents">
                      <Button asChild className="bg-mfo-blue-600 hover:bg-mfo-blue-700">
                        <span>Выбрать файл</span>
                      </Button>
                    </Label>
                    {formData.documents && (
                      <p className="text-green-600 mt-2">
                        ✅ Файл загружен: {formData.documents.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-mfo-blue-800 mb-6">
                    🧮 Калькулятор займа
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-mfo-blue-50 to-white border-mfo-blue-200">
                      <CardHeader>
                        <CardTitle className="text-mfo-blue-700">Параметры займа</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label>Сумма займа: {formData.amount[0].toLocaleString()} ₽</Label>
                          <Slider
                            value={formData.amount}
                            onValueChange={(value) => setFormData({...formData, amount: value})}
                            max={100000}
                            min={5000}
                            step={5000}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>5,000 ₽</span>
                            <span>100,000 ₽</span>
                          </div>
                        </div>
                        <div>
                          <Label>Срок займа: {formData.period[0]} дней</Label>
                          <Slider
                            value={formData.period}
                            onValueChange={(value) => setFormData({...formData, period: value})}
                            max={30}
                            min={7}
                            step={1}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>7 дней</span>
                            <span>30 дней</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                      <CardHeader>
                        <CardTitle className="text-green-700">Расчет платежей</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Сумма займа:</span>
                            <span className="font-bold">{formData.amount[0].toLocaleString()} ₽</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Срок:</span>
                            <span className="font-bold">{formData.period[0]} дней</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ставка:</span>
                            <span className="font-bold">3% в день</span>
                          </div>
                          <hr />
                          <div className="flex justify-between text-lg">
                            <span>К возврату:</span>
                            <span className="font-bold text-green-600">
                              {Math.round(formData.amount[0] * (1 + 0.03 * formData.period[0])).toLocaleString()} ₽
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="text-center space-y-6">
                  <div className="animate-pulse-glow">
                    <Icon name="Clock" size={64} className="mx-auto text-mfo-blue-500 mb-4" />
                  </div>
                  <h2 className="text-2xl font-bold text-mfo-blue-800">
                    ⏱️ Рассмотрение заявки
                  </h2>
                  <div className="bg-mfo-blue-50 rounded-lg p-6 border border-mfo-blue-200">
                    <div className="text-4xl font-bold text-mfo-blue-700 mb-2">
                      {timer} сек
                    </div>
                    <p className="text-mfo-blue-600">
                      Анализируем вашу заявку и кредитную историю...
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <Icon name="FileCheck" className="mx-auto text-green-500 mb-2" />
                      <p className="text-sm">Документы проверены</p>
                    </div>
                    <div className="text-center">
                      <Icon name="Calculator" className="mx-auto text-blue-500 mb-2" />
                      <p className="text-sm">Расчет выполнен</p>
                    </div>
                    <div className="text-center">
                      <Icon name="Shield" className="mx-auto text-orange-500 mb-2" />
                      <p className="text-sm">Проверка кредитной истории</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="text-center space-y-6">
                  {applicationStatus === 'approved' && !hasDebt && (
                    <div className="animate-scale-in">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                        <Icon name="CheckCircle" size={64} className="mx-auto text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-green-700 mb-4">
                          🎉 Заявка одобрена!
                        </h2>
                        <p className="text-green-600 mb-6">
                          Поздравляем! Ваш займ на {formData.amount[0].toLocaleString()} ₽ одобрен.
                        </p>
                        <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
                          Статус: ОДОБРЕНО
                        </Badge>
                        <div className="mt-6">
                          <Button 
                            className="bg-green-600 hover:bg-green-700 mr-4"
                            onClick={() => setShowCallbackDialog(true)}
                          >
                            <Icon name="Phone" className="mr-2" />
                            Получить звонок
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {(applicationStatus === 'rejected' || hasDebt) && (
                    <div className="animate-scale-in">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <Icon name="XCircle" size={64} className="mx-auto text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-red-700 mb-4">
                          ❌ Заявка отклонена
                        </h2>
                        <p className="text-red-600 mb-6">
                          {hasDebt 
                            ? "К сожалению, обнаружена задолженность по другим займам."
                            : "Заявка не соответствует требованиям кредитования."
                          }
                        </p>
                        <Badge className="bg-red-100 text-red-700 text-lg px-4 py-2">
                          Статус: ОТКЛОНЕНО
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Кнопки навигации */}
            {currentStep < 6 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="border-mfo-blue-300 text-mfo-blue-700"
                >
                  <Icon name="ChevronLeft" className="mr-2" />
                  Назад
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-mfo-blue-600 hover:bg-mfo-blue-700 animate-pulse-glow"
                  disabled={
                    (currentStep === 1 && !formData.phone) ||
                    (currentStep === 2 && !formData.address) ||
                    (currentStep === 3 && !formData.relativesContact) ||
                    (currentStep === 4 && !formData.documents)
                  }
                >
                  Далее
                  <Icon name="ChevronRight" className="ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог подтверждения номера телефона */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>📱 Подтверждение номера</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Введите код, отправленный на номер {formData.phone}</p>
            <Input
              placeholder="0000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={4}
              className="text-center text-2xl"
            />
            <Button
              onClick={handleCodeSubmit}
              disabled={verificationCode.length !== 4 || isVerifying}
              className="w-full bg-mfo-blue-600 hover:bg-mfo-blue-700"
            >
              {isVerifying ? 'Проверка...' : 'Подтвердить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог обратного звонка */}
      <Dialog open={showCallbackDialog} onOpenChange={setShowCallbackDialog}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>📞 Обратный звонок</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <Icon name="Phone" size={48} className="mx-auto text-green-500" />
            <p>Наш оператор свяжется с вами в ближайшее время</p>
            <p className="text-sm text-gray-600">
              Звонок будет перенаправлен на номер: 
              <br />
              <strong>8 (999) 943-86-89</strong>
            </p>
            <Button
              onClick={() => {
                // Имитация звонка
                window.location.href = 'tel:+79999438689';
                setShowCallbackDialog(false);
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Icon name="Phone" className="mr-2" />
              Получить звонок сейчас
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Уведомление о куки */}
      <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <Button size="sm" variant="outline" className="mr-4 flex-shrink-0">
            Принять
          </Button>
          <p className="text-sm text-gray-600">
            Мы используем cookies для улучшения работы сайта.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;