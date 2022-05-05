output "private_ip" {
  value = aws_instance.ec2.private_ip
}
output "public_ip" {
  value = aws_eip.ip.public_ip
}

output "lambda_stop_name" {
  value = module.infra-stop-nightly.scheduler_lambda_name
}

output "lambda_stop_arn" {
  value = module.infra-stop-nightly.scheduler_lambda_arn
}

output "lambda_start_name" {
  value = module.infra-start-daily.scheduler_lambda_name
}

output "lambda_start_arn" {
  value = module.infra-start-daily.scheduler_lambda_arn
}

output "lambda_terminate_name" {
  value = module.infra-terminate-daily.scheduler_lambda_name
}

output "lambda_terminate_arn" {
  value = module.infra-terminate-daily.scheduler_lambda_arn
}
