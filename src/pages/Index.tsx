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
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    workAddress: '',
    relativesContact: '',
    amount: [50000],
    period: [30],
    documents: null as File | null,
    passportSeries: '',
    passportNumber: '',
    passportIssueDate: '',
    passportPhoto: null as File | null,
    passportSelfie: null as File | null,
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('reviewing'); // 'approved', 'rejected', 'reviewing'
  const [timer, setTimer] = useState(50);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCallbackDialog, setShowCallbackDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [hasDebt, setHasDebt] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentStep, setDocumentStep] = useState(1);

  // Таймер рассмотрения заявки
  useEffect(() => {
    if (currentStep === 6 && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev === 1) {
            // Случайно определяем одобрение или отказ
            const isApproved = Math.random() > 0.3;
            setApplicationStatus(isApproved ? 'approved' : 'rejected');
            setHasDebt(Math.random() > 0.7);
            
            // Показываем диалог одобрения если заявка одобрена
            if (isApproved && !hasDebt) {
              setTimeout(() => setShowApprovalDialog(true), 1000);
            }
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
    // Генерация кода (имитация)
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setShowCodeDialog(true);
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

  // Экспорт данных для RetailCRM
  const exportToRetailCRM = () => {
    const retailCRMData = {
      // Основная информация клиента
      customer: {
        firstName: formData.firstName || 'Не указано',
        lastName: formData.lastName || 'Не указано',
        email: formData.email || '',
        phones: [{
          number: formData.phone,
          type: 'mobile'
        }],
        address: {
          text: formData.address
        },
        customFields: {
          work_address: formData.workAddress,
          relatives_contact: formData.relativesContact
        }
      },
      // Заявка на займ
      order: {
        orderType: 'loan-application',
        source: 'website',
        status: applicationStatus === 'approved' ? 'approved' : (applicationStatus === 'rejected' ? 'rejected' : 'processing'),
        customFields: {
          loan_amount: formData.amount[0],
          loan_period: formData.period[0],
          loan_rate: '3% в день',
          monthly_payment: calculateMonthlyPayment(),
          has_debt: hasDebt,
          verification_status: isVerifying ? 'pending' : 'completed',
          application_date: new Date().toISOString(),
          timer_remaining: timer
        },
        items: [{
          productName: `Займ на ${formData.amount[0].toLocaleString()} ₽`,
          quantity: 1,
          price: formData.amount[0]
        }]
      },
      // Метаданные
      metadata: {
        source: 'mfo-website',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        form_version: '1.0',
        current_step: currentStep
      }
    };

    // Копирование в буфер обмена
    navigator.clipboard.writeText(JSON.stringify(retailCRMData, null, 2)).then(() => {
      alert('✅ Данные скопированы в буфер обмена!\nТеперь их можно импортировать в RetailCRM');
    }).catch(() => {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(retailCRMData, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('✅ Данные скопированы в буфер обмена!');
    });

    // Логирование для разработчика
    console.log('RetailCRM Export Data:', retailCRMData);
  };

  // Скачивание данных как JSON файл
  const downloadDataAsJSON = () => {
    const dataToExport = {
      customer: formData,
      application: {
        status: applicationStatus,
        amount: formData.amount[0],
        period: formData.period[0],
        monthly_payment: calculateMonthlyPayment(),
        has_debt: hasDebt,
        created_at: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfo-application-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      {/* Заголовок с логотипом */}
      <div className="bg-gradient-to-r from-mfo-blue-600 to-mfo-blue-800 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          {/* Логотип "Деньги в дом" */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-3 bg-white/10 rounded-2xl px-6 py-3 backdrop-blur-sm border border-white/20">
              <div className="text-4xl animate-bounce">🏠</div>
              <div>
                <h1 className="text-3xl font-bold text-white">ДЕНЬГИ В ДОМ</h1>
                <div className="text-yellow-300 text-sm font-medium">БЫСТРЫЕ ЗАЙМЫ</div>
              </div>
              <div className="text-4xl animate-pulse">💰</div>
            </div>
          </div>
          
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
            <div className="animate-fadeInUp">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-mfo-blue-800 mb-6 animate-slideInLeft">
                    📱 Персональные данные
                  </h2>
                  <div className="grid gap-4 animate-scaleInBounce">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="animate-slideInLeft">
                        <Label htmlFor="firstName" className="animate-float">Имя *</Label>
                        <Input
                          id="firstName"
                          placeholder="Введите ваше имя"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="mt-1 transition-all duration-300 focus:animate-pulseGlow"
                        />
                      </div>
                      <div className="animate-slideInRight">
                        <Label htmlFor="lastName" className="animate-float">Фамилия *</Label>
                        <Input
                          id="lastName"
                          placeholder="Введите вашу фамилию"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="mt-1 transition-all duration-300 focus:animate-pulseGlow"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@mail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1"
                      />
                    </div>
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
                  <h2 className="text-2xl font-bold text-mfo-blue-800 mb-6 animate-slideInLeft">
                    📄 Паспортные данные и документы
                  </h2>
                  
                  {/* Поля паспортных данных */}
                  <Card className="animate-fadeInUp bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-700 flex items-center gap-2">
                        <Icon name="CreditCard" className="animate-float" />
                        Данные паспорта
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="animate-slideInLeft">
                          <Label htmlFor="passportSeries" className="animate-float">Серия паспорта *</Label>
                          <Input
                            id="passportSeries"
                            placeholder="1234"
                            maxLength={4}
                            value={formData.passportSeries}
                            onChange={(e) => setFormData({...formData, passportSeries: e.target.value.replace(/\D/g, '')})}
                            className="mt-1 transition-all duration-300 focus:animate-pulseGlow"
                          />
                        </div>
                        <div className="animate-slideInRight">
                          <Label htmlFor="passportNumber" className="animate-float">Номер паспорта *</Label>
                          <Input
                            id="passportNumber"
                            placeholder="567890"
                            maxLength={6}
                            value={formData.passportNumber}
                            onChange={(e) => setFormData({...formData, passportNumber: e.target.value.replace(/\D/g, '')})}
                            className="mt-1 transition-all duration-300 focus:animate-pulseGlow"
                          />
                        </div>
                      </div>
                      <div className="animate-scaleInBounce">
                        <Label htmlFor="passportIssueDate" className="animate-float">Дата выдачи *</Label>
                        <Input
                          id="passportIssueDate"
                          type="date"
                          value={formData.passportIssueDate}
                          onChange={(e) => setFormData({...formData, passportIssueDate: e.target.value})}
                          className="mt-1 transition-all duration-300 focus:animate-pulseGlow"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Загрузка документов */}
                  <Card className="animate-fadeInUp bg-gradient-to-br from-green-50 to-white border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-700 flex items-center gap-2">
                        <Icon name="Camera" className="animate-float" />
                        Загрузка фотографий
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setShowDocumentUpload(true)}
                        className="w-full bg-green-600 hover:bg-green-700 animate-pulseGlow text-lg py-4"
                      >
                        <Icon name="Upload" className="mr-2 animate-float" />
                        Загрузить документы (2 фото)
                      </Button>
                      
                      {/* Статус загруженных файлов */}
                      <div className="mt-4 space-y-2">
                        {formData.passportPhoto && (
                          <div className="flex items-center gap-2 text-green-600 animate-slideInLeft">
                            <Icon name="CheckCircle" />
                            <span>✅ Фото паспорта: {formData.passportPhoto.name}</span>
                          </div>
                        )}
                        {formData.passportSelfie && (
                          <div className="flex items-center gap-2 text-green-600 animate-slideInRight">
                            <Icon name="CheckCircle" />
                            <span>✅ Фото с паспортом: {formData.passportSelfie.name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                  {/* 3D Летящий самолет */}
                  <div className="relative h-32 mb-8 overflow-hidden">
                    {/* Фон неба с градиентом */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-lg"></div>
                    
                    {/* Облака */}
                    <div className="absolute top-4 left-1/4 text-white text-2xl opacity-60 animate-pulse">☁️</div>
                    <div className="absolute top-8 right-1/3 text-white text-xl opacity-40 animate-pulse">☁️</div>
                    <div className="absolute bottom-6 left-1/2 text-white text-lg opacity-50 animate-pulse">☁️</div>
                    
                    {/* Тень самолета */}
                    <div className="absolute bottom-2 animate-plane-shadow">
                      <div className="w-12 h-3 bg-gray-400 opacity-30 rounded-full blur-sm transform scale-x-150"></div>
                    </div>
                    
                    {/* Летящий самолет */}
                    <div className="absolute top-1/2 transform -translate-y-1/2 animate-plane-fly">
                      <div className="text-4xl drop-shadow-lg" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>
                        ✈️
                      </div>
                    </div>
                    
                    {/* Инверсионный след */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 transform -translate-y-1/2">
                      <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-mfo-blue-800">
                    ⏱️ Рассмотрение заявки
                  </h2>
                  <div className="bg-mfo-blue-50 rounded-lg p-6 border border-mfo-blue-200 shadow-lg">
                    <div className="text-4xl font-bold text-mfo-blue-700 mb-2 animate-pulse">
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
                        <h2 className="text-2xl font-bold text-green-700 mb-6">
                          🎉 Заявка одобрена!
                        </h2>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                            <p className="text-lg font-semibold text-green-700 mb-2">
                              Сумма одобрения:
                            </p>
                            <p className="text-3xl font-bold text-green-800">
                              {formData.amount[0].toLocaleString()} ₽
                            </p>
                          </div>
                          <p className="text-green-600 text-lg">
                            С вами свяжется специалист в ближайшее время
                          </p>
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

            {/* Кнопки навигации с анимацией */}
            {currentStep < 6 && (
              <div className="flex justify-between mt-8 animate-fadeInUp">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="border-mfo-blue-300 text-mfo-blue-700 animate-slideInLeft hover:animate-scaleInBounce transition-all duration-300"
                >
                  <Icon name="ChevronLeft" className="mr-2 animate-float" />
                  Назад
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-mfo-blue-600 hover:bg-mfo-blue-700 animate-pulseGlow hover:animate-scaleInBounce transition-all duration-300"
                  disabled={
                    (currentStep === 1 && (!formData.phone || !formData.firstName || !formData.lastName)) ||
                    (currentStep === 2 && !formData.address) ||
                    (currentStep === 3 && !formData.relativesContact) ||
                    (currentStep === 4 && (!formData.documents || !formData.passportSeries || !formData.passportNumber || !formData.passportIssueDate || !formData.passportPhoto || !formData.passportSelfie))
                  }
                >
                  Далее
                  <Icon name="ChevronRight" className="ml-2 animate-float" />
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
            
            {/* Автоматически сгенерированный код */}
            {generatedCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600 mb-2">📨 SMS код отправлен:</p>
                <div className="text-3xl font-bold text-blue-800 tracking-widest animate-pulse">
                  {generatedCode}
                </div>
                <p className="text-xs text-blue-500 mt-2">Скопируйте код в поле ниже</p>
              </div>
            )}
            
            <Input
              placeholder="0000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={4}
              className="text-center text-2xl"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleCodeSubmit}
                disabled={verificationCode.length !== 4 || isVerifying}
                className="flex-1 bg-mfo-blue-600 hover:bg-mfo-blue-700"
              >
                {isVerifying ? 'Проверка...' : 'Подтвердить'}
              </Button>
              
              {generatedCode && (
                <Button
                  variant="outline"
                  onClick={() => setVerificationCode(generatedCode)}
                  className="px-4"
                >
                  Вставить
                </Button>
              )}
            </div>
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

      {/* Диалог одобрения заявки */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="animate-scale-in max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-700">🎉 Заявка одобрена!</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-center">
            <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <Icon name="CheckCircle" size={48} className="text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-green-700">Поздравляем!</h3>
              <p className="text-gray-600">
                Ваш займ на <strong>{formData.amount[0].toLocaleString()} ₽</strong> одобрен
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-700 font-medium mb-2">
                Оператор свяжется с вами в ближайшее время
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Icon name="Phone" size={20} className="text-blue-600" />
                <span className="text-blue-600 font-bold">+7 (499) 388-38-38</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowApprovalDialog(false);
                  handleNextStep();
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Icon name="ArrowRight" className="mr-2" />
                Продолжить
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = 'tel:+74993883838';
                }}
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Icon name="Phone" className="mr-2" />
                Позвонить сейчас
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог пошаговой загрузки документов */}
      <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-blue-700 flex items-center justify-center gap-2">
              <Icon name="FileText" className="animate-float" />
              Загрузка документов
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Прогресс загрузки документов */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Шаг {documentStep} из 2</div>
              <Progress value={(documentStep / 2) * 100} className="h-2" />
            </div>

            {/* Шаг 1: Фото паспорта */}
            {documentStep === 1 && (
              <div className="text-center space-y-4 animate-fadeInUp">
                <div className="text-6xl mb-4">📘</div>
                <h3 className="text-lg font-bold text-blue-700">Сфотографируйте паспорт</h3>
                <ul className="text-left text-sm text-gray-600 space-y-1 bg-blue-50 p-4 rounded-lg">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Разворот с фото и данными
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Четкое изображение без бликов
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Все данные видны и читаемы
                  </li>
                </ul>
                
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({...formData, passportPhoto: file});
                      setDocumentStep(2);
                    }
                  }}
                  className="hidden"
                  id="passport-photo"
                />
                <Label htmlFor="passport-photo">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <span className="flex items-center gap-2">
                      <Icon name="Camera" />
                      Сделать фото паспорта
                    </span>
                  </Button>
                </Label>
              </div>
            )}

            {/* Шаг 2: Селфи с паспортом */}
            {documentStep === 2 && (
              <div className="text-center space-y-4 animate-fadeInUp">
                <div className="text-6xl mb-4">🤳</div>
                <h3 className="text-lg font-bold text-blue-700">Сделайте селфи с паспортом</h3>
                <ul className="text-left text-sm text-gray-600 space-y-1 bg-green-50 p-4 rounded-lg">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Держите паспорт рядом с лицом
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Хорошее освещение
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Лицо и паспорт четко видны
                  </li>
                </ul>
                
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({...formData, passportSelfie: file});
                      setShowDocumentUpload(false);
                      setDocumentStep(1);
                    }
                  }}
                  className="hidden"
                  id="passport-selfie"
                />
                <div className="space-y-3">
                  <Label htmlFor="passport-selfie">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <span className="flex items-center gap-2">
                        <Icon name="Camera" />
                        Сделать селфи с паспортом
                      </span>
                    </Button>
                  </Label>
                  
                  <Button
                    variant="outline"
                    onClick={() => setDocumentStep(1)}
                    className="w-full"
                  >
                    <Icon name="ArrowLeft" className="mr-2" />
                    Назад к фото паспорта
                  </Button>
                </div>
              </div>
            )}

            {/* Кнопка отмены */}
            <Button
              variant="outline"
              onClick={() => {
                setShowDocumentUpload(false);
                setDocumentStep(1);
              }}
              className="w-full text-gray-500"
            >
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Index;